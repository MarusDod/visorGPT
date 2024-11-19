import { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AuthForm({
  children,
  header,
  onSubmit,
}: {
  header: string;
  children: ReactNode;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
}) {
  return (
    <div className="w-[400px] h-[500px] shadow-black bg-slate-700 flex flex-col items-center justify-evenly border-spacing-3 border-black rounded">
      <span className="text-[2.5rem]">{header}</span>
      <form className="contents" onSubmit={onSubmit}>
        {children}
        <div className="flex gap-8 flex-row-reverse">
          <button type={"submit"}>Submit</button>
          <Link to={"/"}>
            <button className="bg-slate-500 text-black">Go back</button>
          </Link>
        </div>
      </form>
    </div>
  );
}
