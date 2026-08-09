export type UserType = {
  _id: string;
  name: string;
  profilePicture?: string;
  username: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  isPaid?: boolean;
  details?: {
    gender?: string;
    age?: string;
    weight?: string;
    height?: string;
    fitnessGoal?: string;
    activityLevel?: string;
    equipmentType?: string;
    daysPerWeek?: string;
    minutesPerSession?: string;
  };
}