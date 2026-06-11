import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import Link from "next/link";

import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";

export type PolicySection = {
  id: string;
  title: string;
  description?: string;
  paragraphs?: string[];
  items?: string[];
  note?: string;
};

type PolicyPageShellProps = {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  summary: string;
  updatedAt: string;
  sections: PolicySection[];
  relatedHref: string;
  relatedLabel: string;
};

export function PolicyPageShell({
  icon: Icon,
  eyebrow,
  title,
  summary,
  updatedAt,
  sections,
  relatedHref,
  relatedLabel,
}: PolicyPageShellProps) {
  return (
    <div className="min-h-screen bg-white text-zinc-950 selection:bg-red-100">
      <Navbar />

      <main>
        <section className="border-b border-zinc-200 bg-zinc-50/70">
          <div className="container mx-auto max-w-[1120px] px-4 py-14 md:px-6 md:py-20 lg:px-8">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-xs font-normal text-red-700">
                <Icon className="h-3.5 w-3.5" />
                {eyebrow}
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-zinc-950 sm:text-5xl">
                {title}
              </h1>
              <p className="mt-5 max-w-2xl text-base font-normal leading-7 text-zinc-500">
                {summary}
              </p>
              <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-xs font-normal text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Áp dụng cho Digital Rental
                </span>
                <span>Cập nhật: {updatedAt}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-12 md:py-16">
          <div className="container mx-auto grid max-w-[1120px] gap-8 px-4 md:px-6 lg:grid-cols-[250px_minmax(0,1fr)] lg:px-8">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/60 p-4">
                <p className="px-2 text-xs font-medium text-zinc-400">
                  Nội dung chính
                </p>
                <nav className="mt-3 space-y-1">
                  {sections.map((section, index) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="flex items-start gap-2 rounded-xl px-2 py-2.5 text-sm font-normal text-zinc-600 transition-colors hover:bg-white hover:text-red-600"
                    >
                      <span className="mt-0.5 text-xs font-medium text-zinc-400">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>{section.title}</span>
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            <div className="min-w-0">
              <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                {sections.map((section, index) => (
                  <article
                    key={section.id}
                    id={section.id}
                    className={`scroll-mt-24 p-5 sm:p-7 ${
                      index !== sections.length - 1
                        ? "border-b border-zinc-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-50 text-xs font-semibold text-red-600">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-950">
                          {section.title}
                        </h2>
                        {section.description && (
                          <p className="mt-2 text-sm font-normal leading-6 text-zinc-500">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {section.paragraphs && (
                      <div className="mt-5 space-y-3 text-sm font-normal leading-7 text-zinc-600">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                    )}

                    {section.items && (
                      <div className="mt-5 grid gap-2">
                        {section.items.map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-2.5 rounded-xl bg-zinc-50 px-3.5 py-3"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                            <p className="text-sm font-normal leading-6 text-zinc-600">
                              {item}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.note && (
                      <div className="mt-5 rounded-xl border border-amber-100 bg-amber-50/70 p-4 text-sm font-normal leading-6 text-amber-900">
                        {section.note}
                      </div>
                    )}
                  </article>
                ))}
              </div>

              <div className="mt-6 grid gap-4 rounded-xl border border-zinc-200 bg-zinc-50/70 p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
                <div>
                  <p className="text-sm font-medium text-zinc-900">
                    Cần làm rõ thông tin?
                  </p>
                  <a
                    href="mailto:adminlenshub@gmail.com"
                    className="mt-2 inline-flex items-center gap-2 text-sm font-normal text-zinc-500 transition-colors hover:text-red-600"
                  >
                    <Mail className="h-4 w-4" />
                    adminlenshub@gmail.com
                  </a>
                </div>
                <Link
                  href={relatedHref}
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
                >
                  {relatedLabel}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
