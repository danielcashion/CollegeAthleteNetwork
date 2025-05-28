'use client';

import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Link from 'next/link';

interface MDXContentProps {
  source: string;
}

const MDXContent = async ({ source }: MDXContentProps) => {
  const mdxSource = await serialize(source);

  return (
    <MDXRemote
      {...mdxSource}
      components={{
        a: ({ href, children }) => (
          <Link href={href || '#'} className="text-blue-600 hover:underline">
            {children}
          </Link>
        ),
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-2xl font-semibold mt-6 mb-3 text-gray-800">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-xl font-medium mt-4 mb-2 text-gray-700">{children}</h3>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mb-4">{children}</ul>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-gray-600">{children}</p>
        ),
      }}
    />
  );
};

export default MDXContent; 