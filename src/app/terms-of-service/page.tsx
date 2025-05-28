import React from 'react';
import { MDXRemote } from 'next-mdx-remote';
import { serialize } from 'next-mdx-remote/serialize';
import Link from 'next/link';
import { promises as fs } from 'fs';
import path from 'path';

export const metadata = {
  title: 'Terms and Conditions | The College Athlete Network',
  description: 'Read the Terms and Conditions for using The College Athlete Networks services, including user responsibilities, privacy, and dispute resolution.',
};

const TermsPage = async () => {
  const filePath = path.join(process.cwd(), 'src/app/terms-of-service/terms-content.md');
  const source = await fs.readFile(filePath, 'utf8');
  const mdxSource = await serialize(source);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Terms and Conditions</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="prose prose-lg max-w-none">
          <MDXRemote {...mdxSource} />
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} The College Athlete Network, LLC. All rights reserved.
            <span className="ml-4">
              <Link href="/privacy-policy" className="hover:underline">
                Privacy Policy
              </Link>
            </span>
            <span className="ml-4">
              <Link href="/contact" className="hover:underline">
                Contact Us
              </Link>
            </span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TermsPage;