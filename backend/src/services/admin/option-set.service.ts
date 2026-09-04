import mongoose from 'mongoose';
import { OptionSet } from '../../models/option-set.model';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export interface OptionChoiceInput {
  id?: string;
  name: string;
  sort_order?: number;
}

export interface OptionSetInput {
  name: string;
  is_active?: boolean;
  sort_order?: number;
  choices?: OptionChoiceInput[];
}

function mapOptionSet(doc: InstanceType<typeof OptionSet>) {
  const choices = [...(doc.choices ?? [])].sort((a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name));
  return {
    id: doc._id.toString(),
    name: doc.name,
    is_active: doc.is_active,
    sort_order: doc.sort_order,
    choices: choices.map((choice) => ({
      id: choice._id.toString(),
      name: choice.name,
      sort_order: choice.sort_order
    })),
    created_at: doc.created_at,
    updated_at: doc.updated_at
  };
}

function buildChoices(choices: OptionChoiceInput[] = []) {
  if (choices.length === 0) {
    throw new BadRequestError('Option set must include at least one choice');
  }

  return choices.map((choice, index) => ({
    ...(choice.id && mongoose.Types.ObjectId.isValid(choice.id)
      ? { _id: new mongoose.Types.ObjectId(choice.id) }
      : {}),
    name: choice.name.trim(),
    sort_order: choice.sort_order ?? index
  }));
}

export class OptionSetService {
  async list() {
    const docs = await OptionSet.find().sort({ sort_order: 1, name: 1 }).exec();
    return docs.map(mapOptionSet);
  }

  async getById(id: string) {
    const doc = await OptionSet.findById(id).exec();
    if (!doc) throw new NotFoundError('Option set not found');
    return mapOptionSet(doc);
  }

  async create(data: OptionSetInput) {
    const doc = await OptionSet.create({
      name: data.name.trim(),
      is_active: data.is_active ?? true,
      sort_order: data.sort_order ?? 0,
      choices: buildChoices(data.choices)
    });
    return mapOptionSet(doc);
  }

  async update(id: string, data: Partial<OptionSetInput>) {
    const existing = await OptionSet.findById(id).exec();
    if (!existing) throw new NotFoundError('Option set not found');

    if (data.name !== undefined) existing.name = data.name.trim();
    if (data.is_active !== undefined) existing.is_active = data.is_active;
    if (data.sort_order !== undefined) existing.sort_order = data.sort_order;
    if (data.choices !== undefined) {
      existing.choices = buildChoices(data.choices) as typeof existing.choices;
      existing.markModified('choices');
    }

    await existing.save();
    return mapOptionSet(existing);
  }

  async remove(id: string) {
    const doc = await OptionSet.findByIdAndDelete(id).exec();
    if (!doc) throw new NotFoundError('Option set not found');
    return mapOptionSet(doc);
  }
}

export const optionSetService = new OptionSetService();
