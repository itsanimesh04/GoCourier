import mongoose from 'mongoose';
import { AddonGroup } from '../../models/addon-group.model';
import { AddonSubGroup } from '../../models/addon-subgroup.model';
import { FoodAddon } from '../../models/food-addon.model';
import { NotFoundError } from '../../utils/errors';
import { s3Service } from '../storage/s3.service';

export interface NestedAddonInput {
  id?: string;
  name: string;
  price: string;
  is_veg?: boolean | null;
  image_url?: string | null;
  image_key?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export interface NestedSubGroupInput {
  id?: string;
  name?: string;
  sort_order?: number;
  addons?: NestedAddonInput[];
}

export interface NestedGroupInput {
  name: string;
  is_active?: boolean;
  sort_order?: number;
  subgroups?: NestedSubGroupInput[];
}

function mapAddon(doc: InstanceType<typeof FoodAddon>) {
  return {
    id: doc._id.toString(),
    subgroup_id: doc.subgroup_id?.toString() ?? null,
    name: doc.name,
    price: doc.price,
    is_veg: doc.is_veg,
    image_url: doc.image_url,
    image_key: doc.image_key,
    sort_order: doc.sort_order,
    is_active: doc.is_active
  };
}

export async function hydrateAddonGroups(groupIds: string[], activeAddonsOnly = false) {
  if (groupIds.length === 0) return [];

  const groups = await AddonGroup.find({
    _id: { $in: groupIds },
    ...(activeAddonsOnly ? { is_active: true } : {})
  })
    .sort({ sort_order: 1, name: 1 })
    .exec();

  const orderedGroups = groupIds
    .map((id) => groups.find((g) => g._id.toString() === id))
    .filter((g): g is NonNullable<typeof g> => Boolean(g));

  const resolvedIds = orderedGroups.map((g) => g._id);
  const subgroups = await AddonSubGroup.find({ group_id: { $in: resolvedIds } })
    .sort({ sort_order: 1, name: 1 })
    .exec();

  const subgroupIds = subgroups.map((s) => s._id);
  const addonFilter: Record<string, unknown> = { subgroup_id: { $in: subgroupIds } };
  if (activeAddonsOnly) addonFilter.is_active = true;

  const addons = subgroupIds.length
    ? await FoodAddon.find(addonFilter).sort({ sort_order: 1, name: 1 }).exec()
    : [];

  const addonsBySubgroup = new Map<string, ReturnType<typeof mapAddon>[]>();
  for (const addon of addons) {
    const key = addon.subgroup_id?.toString() ?? '';
    const list = addonsBySubgroup.get(key) ?? [];
    list.push(mapAddon(addon));
    addonsBySubgroup.set(key, list);
  }

  const subgroupsByGroup = new Map<string, typeof subgroups>();
  for (const sub of subgroups) {
    const key = sub.group_id.toString();
    const list = subgroupsByGroup.get(key) ?? [];
    list.push(sub);
    subgroupsByGroup.set(key, list);
  }

  return orderedGroups.map((group) => ({
    id: group._id.toString(),
    name: group.name,
    is_active: group.is_active,
    sort_order: group.sort_order,
    created_at: group.created_at,
    updated_at: group.updated_at,
    subgroups: (subgroupsByGroup.get(group._id.toString()) ?? []).map((sub) => ({
      id: sub._id.toString(),
      group_id: sub.group_id.toString(),
      name: sub.name,
      sort_order: sub.sort_order,
      addons: addonsBySubgroup.get(sub._id.toString()) ?? []
    }))
  }));
}

export function flattenAddonsFromGroups(
  groups: Awaited<ReturnType<typeof hydrateAddonGroups>>
) {
  return groups.flatMap((group) =>
    group.subgroups.flatMap((sub) =>
      sub.addons.map((addon) => ({
        id: addon.id,
        name: addon.name,
        price: Number(addon.price),
        is_veg: addon.is_veg,
        image_url: addon.image_url
      }))
    )
  );
}

async function syncGroupTree(groupId: string, subgroups: NestedSubGroupInput[] = []) {
  const existingSubs = await AddonSubGroup.find({ group_id: groupId }).exec();
  const existingSubIds = new Set(existingSubs.map((s) => s._id.toString()));
  const keptSubIds = new Set<string>();

  for (let i = 0; i < subgroups.length; i++) {
    const input = subgroups[i];
    let subId: string;

    if (input.id && existingSubIds.has(input.id)) {
      await AddonSubGroup.findByIdAndUpdate(input.id, {
        name: input.name ?? '',
        sort_order: input.sort_order ?? i
      }).exec();
      subId = input.id;
      keptSubIds.add(input.id);
    } else {
      const created = await AddonSubGroup.create({
        group_id: groupId,
        name: input.name ?? '',
        sort_order: input.sort_order ?? i
      });
      subId = created._id.toString();
      keptSubIds.add(subId);
    }

    const existingAddons = await FoodAddon.find({ subgroup_id: subId }).exec();
    const existingAddonIds = new Set(existingAddons.map((a) => a._id.toString()));
    const keptAddonIds = new Set<string>();
    const addonInputs = input.addons ?? [];

    for (let j = 0; j < addonInputs.length; j++) {
      const addon = addonInputs[j];
      const payload = {
        subgroup_id: new mongoose.Types.ObjectId(subId),
        name: addon.name,
        price: addon.price,
        is_veg: addon.is_veg ?? null,
        image_url: addon.image_url ?? null,
        image_key: addon.image_key ?? null,
        sort_order: addon.sort_order ?? j,
        is_active: addon.is_active ?? true
      };

      if (addon.id && existingAddonIds.has(addon.id)) {
        const prev = existingAddons.find((a) => a._id.toString() === addon.id);
        if (
          prev?.image_key &&
          payload.image_key !== undefined &&
          payload.image_key !== prev.image_key
        ) {
          await s3Service.delete(prev.image_key).catch(() => undefined);
        }
        await FoodAddon.findByIdAndUpdate(addon.id, payload).exec();
        keptAddonIds.add(addon.id);
      } else {
        const created = await FoodAddon.create(payload);
        keptAddonIds.add(created._id.toString());
      }
    }

    for (const old of existingAddons) {
      if (!keptAddonIds.has(old._id.toString())) {
        if (old.image_key) {
          await s3Service.delete(old.image_key).catch(() => undefined);
        }
        await FoodAddon.findByIdAndDelete(old._id).exec();
      }
    }
  }

  for (const old of existingSubs) {
    if (!keptSubIds.has(old._id.toString())) {
      const orphanAddons = await FoodAddon.find({ subgroup_id: old._id }).exec();
      for (const addon of orphanAddons) {
        if (addon.image_key) {
          await s3Service.delete(addon.image_key).catch(() => undefined);
        }
        await FoodAddon.findByIdAndDelete(addon._id).exec();
      }
      await AddonSubGroup.findByIdAndDelete(old._id).exec();
    }
  }
}

export class AddonGroupService {
  async list() {
    const groups = await AddonGroup.find().sort({ sort_order: 1, name: 1 }).exec();
    return hydrateAddonGroups(groups.map((g) => g._id.toString()));
  }

  async getById(id: string) {
    const group = await AddonGroup.findById(id).exec();
    if (!group) throw new NotFoundError('Addon group not found');
    const [hydrated] = await hydrateAddonGroups([id]);
    return hydrated;
  }

  async create(data: NestedGroupInput) {
    const group = await AddonGroup.create({
      name: data.name,
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? 0
    });
    await syncGroupTree(group._id.toString(), data.subgroups ?? []);
    const [hydrated] = await hydrateAddonGroups([group._id.toString()]);
    return hydrated;
  }

  async update(id: string, data: Partial<NestedGroupInput>) {
    const existing = await AddonGroup.findById(id).exec();
    if (!existing) throw new NotFoundError('Addon group not found');

    await AddonGroup.findByIdAndUpdate(id, {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.is_active !== undefined ? { is_active: data.is_active } : {}),
      ...(data.sort_order !== undefined ? { sort_order: data.sort_order } : {})
    }).exec();

    if (data.subgroups !== undefined) {
      await syncGroupTree(id, data.subgroups);
    }

    const [hydrated] = await hydrateAddonGroups([id]);
    return hydrated;
  }

  async remove(id: string) {
    const group = await AddonGroup.findById(id).exec();
    if (!group) throw new NotFoundError('Addon group not found');

    const subgroups = await AddonSubGroup.find({ group_id: id }).exec();
    const subgroupIds = subgroups.map((s) => s._id);
    const addons = subgroupIds.length
      ? await FoodAddon.find({ subgroup_id: { $in: subgroupIds } }).exec()
      : [];

    for (const addon of addons) {
      if (addon.image_key) {
        await s3Service.delete(addon.image_key).catch(() => undefined);
      }
    }

    if (subgroupIds.length) {
      await FoodAddon.deleteMany({ subgroup_id: { $in: subgroupIds } }).exec();
      await AddonSubGroup.deleteMany({ group_id: id }).exec();
    }
    await AddonGroup.findByIdAndDelete(id).exec();
    return { deleted: true, id };
  }
}

export const addonGroupService = new AddonGroupService();
