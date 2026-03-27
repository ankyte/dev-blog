import Fuse from "fuse.js";
import { useEffect, useRef, useState, useMemo } from "react";
import Card from "@components/Card";
import slugify from "@utils/slugify";
import type { CollectionEntry } from "astro:content";

export type SearchItem = {
  title: string;
  description: string;
  data: CollectionEntry<"blog">["data"];
};

interface Props {
  searchList: SearchItem[];
}

interface SearchResult {
  item: SearchItem;
  refIndex: number;
}

export default function SearchBar({ searchList }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputVal, setInputVal] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  );

  const handleChange = (e: React.FormEvent<HTMLInputElement>) => {
    setInputVal(e.currentTarget.value);
  };

  const fuse = useMemo(
    () =>
      new Fuse(searchList, {
        keys: ["title", "description"],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.5,
      }),
    [searchList]
  );

  useEffect(() => {
    // if URL has search query,
    // insert that search query in input field
    const searchUrl = new URLSearchParams(window.location.search);
    const searchStr = searchUrl.get("q");
    if (searchStr) setInputVal(searchStr);

    // put focus cursor at the end of the string
    setTimeout(function () {
      inputRef.current!.selectionStart = inputRef.current!.selectionEnd =
        searchStr?.length || 0;
    }, 50);
  }, []);

  useEffect(() => {
    // Add search result only if
    // input value is more than one character
    let inputResult = inputVal.length > 1 ? fuse.search(inputVal) : [];
    setSearchResults(inputResult);

    // Update search string in URL
    if (inputVal.length > 0) {
      const searchParams = new URLSearchParams(window.location.search);
      searchParams.set("q", inputVal);
      const newRelativePathQuery =
        window.location.pathname + "?" + searchParams.toString();
      history.replaceState(history.state, "", newRelativePathQuery);
    } else {
      history.replaceState(history.state, "", window.location.pathname);
    }
  }, [inputVal]);

  return (
    <>
      <div className="border border-skin-line bg-skin-surface p-4 sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <p className="font-mono text-[0.68rem] uppercase tracking-[0.24em] text-skin-muted">
            Search the archive
          </p>
          <span className="font-mono text-[0.68rem] uppercase tracking-[0.2em] text-skin-muted">
            2+ chars
          </span>
        </div>
        <label className="relative flex items-center border border-skin-line bg-skin-card transition-colors duration-150 focus-within:border-skin-accent focus-within:bg-skin-surface">
          <span className="pointer-events-none flex h-14 w-14 items-center justify-center border-r border-skin-muted text-skin-muted">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-5 w-5"
            >
              <path d="M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z"></path>
            </svg>
          </span>
          <input
            className="bg-transparent block w-full appearance-none px-4 py-4 text-lg tracking-[-0.02em] text-skin-base placeholder:font-mono placeholder:text-[0.72rem] placeholder:uppercase placeholder:tracking-[0.22em] placeholder:text-skin-muted focus:outline-none"
            placeholder="Search articles, topics, and titles"
            type="text"
            name="search"
            value={inputVal}
            onChange={handleChange}
            autoComplete="off"
            autoFocus
            ref={inputRef}
          />
        </label>
      </div>

      {inputVal.length > 1 && (
        <div className="mt-6 flex items-center justify-between gap-3 border border-skin-line bg-skin-surface px-4 py-3 font-mono text-[0.72rem] uppercase tracking-[0.22em] text-skin-muted">
          Found {searchResults?.length}
          {searchResults?.length && searchResults?.length === 1
            ? " result"
            : " results"}{" "}
          for '{inputVal}'
        </div>
      )}

      <ul className="mt-4">
        {searchResults &&
          searchResults.map(({ item, refIndex }) => (
            <Card
              href={`/posts/${slugify(item.data)}`}
              frontmatter={item.data}
              key={`${refIndex}-${slugify(item.data)}`}
            />
          ))}
      </ul>
    </>
  );
}
