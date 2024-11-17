import ReactLoading from "react-loading";

export default function LazyLoading({ size }: { size: number }) {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <ReactLoading type="spin" width={size} height={size} />
    </div>
  );
}
