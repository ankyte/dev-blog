import { slugifyStr } from "@utils/slugify";
import Datetime from "./Datetime";
import type { CollectionEntry } from "astro:content";

export interface Props {
  href?: string;
  frontmatter: CollectionEntry<"blog">["data"];
  secHeading?: boolean;
}

export default function Card({ href, frontmatter, secHeading = true }: Props) {
  const { title, pubDatetime, description } = frontmatter;

  const headerProps = {
    style: { viewTransitionName: slugifyStr(title) },
    className:
      "text-xl font-semibold tracking-[-0.03em] text-skin-base transition-colors duration-150 group-hover:text-skin-accent sm:text-2xl",
  };

  return (
    <li className="list-none border-b border-skin-muted py-6 last:border-b-0">
      <a
        href={href}
        className="group block transition-colors duration-150 hover:text-skin-accent"
      >
        <div className="mb-3 flex items-start justify-between gap-4">
          {secHeading ? (
            <h2 {...headerProps}>{title}</h2>
          ) : (
            <h3 {...headerProps}>{title}</h3>
          )}
          <span className="mt-1 font-mono text-lg text-skin-muted transition-transform duration-150 group-hover:translate-x-1">
            /
          </span>
        </div>
        <Datetime datetime={pubDatetime} className="mb-3" />
        <p className="max-w-2xl leading-7 text-skin-muted">{description}</p>
      </a>
    </li>
  );
}
