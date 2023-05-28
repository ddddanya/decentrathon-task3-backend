import mongoose, { Schema, Document } from "mongoose";

export interface IProvider extends Document {
  address: string;
  uptime: number;
  usedSpace: number;
  latency: number;
}

const ProviderSchema: Schema = new Schema({
  address: {
    type: String,
  },
  uptime: {
    type: Number,
  },
  usedSpace: {
    type: Number,
  },
  latency: {
    type: Number,
  },
});

const Provider = mongoose.model<IProvider>("provider", ProviderSchema);

export default Provider;
