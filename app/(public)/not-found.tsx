import { ButtonLink } from "@/components/ui/button";

export default function PublicNotFound() {
  return (
    <div className="page-container py-24 text-center sm:py-32">
      <p className="text-sm font-semibold tracking-[0.2em] text-accent">404</p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        We could not find that page
      </h1>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-ink-soft">
        The link may be out of date, or the position you were looking for is no
        longer listed.
      </p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <ButtonLink href="/">Back to Home</ButtonLink>
        <ButtonLink href="/jobs" variant="secondary">
          Browse Jobs
        </ButtonLink>
      </div>
    </div>
  );
}
