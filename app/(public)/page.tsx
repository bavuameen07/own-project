import type { Metadata } from "next";
import Link from "next/link";

import { JobCard } from "@/components/job-card";
import { ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { ArrowRightIcon, CheckIcon } from "@/components/ui/icons";
import { SITE_DESCRIPTION } from "@/lib/env";
import { getOpenVacancies, toUserMessage } from "@/lib/recruitment-api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Find Your Next Opportunity",
  description: SITE_DESCRIPTION,
};

const STEPS = [
  {
    number: "01",
    title: "Explore Opportunities",
    description:
      "Browse open roles with clear details on location, job type and openings.",
  },
  {
    number: "02",
    title: "Submit Your Application",
    description:
      "Fill in a short application form with your details and resume link.",
  },
  {
    number: "03",
    title: "Application Review",
    description:
      "The hiring team reviews every application and shortlists candidates.",
  },
  {
    number: "04",
    title: "Interview & Selection",
    description:
      "Shortlisted candidates are contacted directly to discuss next steps.",
  },
];

const BENEFITS = [
  {
    title: "Listings straight from the team",
    description:
      "Every open position is published directly by the hiring team, so what you see is what is available.",
  },
  {
    title: "Applications that take minutes",
    description:
      "No lengthy forms. Add your name, contact details and experience and you are done.",
  },
  {
    title: "A transparent process",
    description:
      "Four clear stages from exploring roles to selection, so you always know what happens next.",
  },
  {
    title: "Direct follow-up",
    description:
      "Shortlisted candidates are contacted directly about interviews and next steps.",
  },
];

async function FeaturedJobs() {
  let vacancies;
  try {
    vacancies = await getOpenVacancies();
  } catch (error) {
    return (
      <ErrorState message={toUserMessage(error, "Unable to load open positions.")} />
    );
  }

  if (vacancies.length === 0) {
    return (
      <EmptyState
        title="No open positions available"
        description="There are no live roles right now. Check back soon — new positions are added regularly."
        action={{ label: "Browse all jobs", href: "/jobs" }}
      />
    );
  }

  const featured = vacancies.slice(0, 6);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {featured.map((vacancy, index) => (
        <JobCard key={vacancy.VacancyID} vacancy={vacancy} index={index} />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* ---------------------------------------------------------------- Hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(37,99,235,0.10),transparent_55%)]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgba(17,17,17,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,17,17,0.05)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        />

        <div className="page-container relative py-20 text-center sm:py-28">
          <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 text-xs font-medium text-ink-soft shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Open positions updated in real time
          </span>

          <h1 className="animate-fade-up stagger-1 mx-auto mt-7 max-w-3xl text-4xl font-semibold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[3.6rem]">
            Find Your Next{" "}
            <span className="text-accent">Opportunity</span>
          </h1>

          <p className="animate-fade-up stagger-2 mx-auto mt-6 max-w-xl text-base leading-relaxed text-ink-soft sm:text-lg">
            Discover meaningful career opportunities and take the next step in
            your professional journey.
          </p>

          <div className="animate-fade-up stagger-3 mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/jobs" size="lg">
              View Open Positions
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="/jobs" variant="secondary" size="lg">
              Apply Now
            </ButtonLink>
          </div>

          <ul className="animate-fade-up stagger-4 mx-auto mt-12 flex max-w-2xl flex-col items-center justify-center gap-x-8 gap-y-3 text-sm text-ink-soft sm:flex-row">
            {[
              "Real openings",
              "Two-minute applications",
              "Clear hiring process",
            ].map((item) => (
              <li key={item} className="inline-flex items-center gap-2">
                <CheckIcon className="h-4 w-4 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- Featured jobs */}
      <section aria-labelledby="featured-heading" className="py-20 sm:py-24">
        <div className="page-container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <span className="eyebrow">Now hiring</span>
              <h2
                id="featured-heading"
                className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.1rem]"
              >
                Featured opportunities
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
                A live selection of open positions. Every role links to a full
                description and a short application form.
              </p>
            </div>
            <Link
              href="/jobs"
              className="group inline-flex items-center gap-2 self-start rounded-full text-sm font-medium text-ink transition-colors hover:text-accent-deep sm:self-auto"
            >
              View all positions
              <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-10">
            <FeaturedJobs />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------- Process */}
      <section
        id="process"
        aria-labelledby="process-heading"
        className="scroll-mt-24 border-y border-line bg-surface py-20 sm:py-24"
      >
        <div className="page-container">
          <div className="max-w-2xl">
            <span className="eyebrow">How it works</span>
            <h2
              id="process-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.1rem]"
            >
              A straightforward recruitment process
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-soft sm:text-base">
              Four steps from first look to final selection — no guesswork at
              any stage.
            </p>
          </div>

          <ol className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li
                key={step.number}
                className={`card animate-fade-up relative p-6 ${index <= 3 ? `stagger-${index + 1}` : ""}`}
              >
                <span className="text-sm font-semibold tracking-widest text-accent">
                  {step.number}
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ----------------------------------------------------------- Why apply */}
      <section
        id="why-apply"
        aria-labelledby="why-heading"
        className="scroll-mt-24 py-20 sm:py-24"
      >
        <div className="page-container grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:items-start">
          <div className="lg:sticky lg:top-28">
            <span className="eyebrow">Why apply</span>
            <h2
              id="why-heading"
              className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-[2.1rem]"
            >
              Built to respect your time
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft sm:text-base">
              We keep the application short and the process transparent so you
              can focus on the role itself.
            </p>
            <ButtonLink href="/jobs" variant="secondary" className="mt-7">
              See open positions
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {BENEFITS.map((benefit, index) => (
              <div
                key={benefit.title}
                className={`card animate-fade-up p-6 ${index <= 3 ? `stagger-${index + 1}` : ""}`}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-soft text-accent-deep">
                  <CheckIcon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-ink">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ CTA + contact */}
      <section
        id="contact"
        aria-labelledby="cta-heading"
        className="scroll-mt-24 border-t border-line bg-surface py-20 sm:py-24"
      >
        <div className="page-container text-center">
          <h2
            id="cta-heading"
            className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-ink sm:text-[2.2rem]"
          >
            Ready for your next opportunity?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ink-soft sm:text-base">
            Browse the live openings and send your application in a couple of
            minutes.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <ButtonLink href="/jobs" size="lg">
              View Jobs
              <ArrowRightIcon className="h-4 w-4" />
            </ButtonLink>
          </div>

          <div className="mx-auto mt-12 max-w-3xl rounded-2xl border border-line bg-canvas px-6 py-6 text-left sm:flex sm:items-center sm:justify-between sm:gap-6">
            <div>
              <h3 className="text-sm font-semibold text-ink">Questions?</h3>
              <p className="mt-1 text-sm text-ink-soft">
                Reach the hiring team at{" "}
                <a
                  href="mailto:contact@openroles.example"
                  className="font-medium text-accent-deep underline-offset-4 hover:underline"
                >
                  contact@openroles.example
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
