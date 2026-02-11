import * as runtime from "react/jsx-runtime";
import { Callout } from "@/components/mdx/callout";
import { ChessDiagram } from "@/components/mdx/chess-diagram";

const sharedComponents = {
  Callout,
  ChessDiagram,
};

// Required by @next/mdx and Velite MDX body rendering
const useMDXComponent = (code: string) => {
  const fn = new Function(code);
  return fn({ ...runtime }).default;
};

interface MDXProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

export function MDXContent({ code, components }: MDXProps) {
  const Component = useMDXComponent(code);
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:scroll-mt-20 prose-headings:font-semibold prose-a:text-primary prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-img:rounded-xl prose-pre:border prose-pre:border-border">
      <Component components={{ ...sharedComponents, ...components }} />
    </div>
  );
}
