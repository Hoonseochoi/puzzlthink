import { M2MiniBoard } from './M2Parts';

/** Home card picture: a calm board on its way to 2048. */
export default function Merge2048Preview() {
  return <div className="w-full sm:w-[64%]"><M2MiniBoard cells={[2, 0, 4, 2, 8, 16, 0, 4, 32, 64, 128, 0, 2048, 512, 256, 8]} eyes /></div>;
}
