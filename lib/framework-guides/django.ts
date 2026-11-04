import type { FrameworkGuide } from "./types";

export const DJANGO: FrameworkGuide = {
  slug: "django",
  label: "Django",
  kind: "project",
  languages: ["Python"],
  repos: ["github/PostHog/posthog", "github/getsentry/sentry", "github/wagtail/wagtail", "github/makeplane/plane"],
  frameworkRepo: "github/django/django",
  intro:
    "An agent knows `manage.py`; what it doesn't know is your settings module, which apps are yours, and how you want migrations handled. Say those, and how to run one test.",
  commands: [
    { cmd: "python manage.py runserver", note: "dev server on 127.0.0.1:8000; never for production" },
    { cmd: "python manage.py makemigrations && python manage.py migrate", note: "after any model change" },
    {
      cmd: "python manage.py test app.tests.SomeTest.test_one",
      note: "one test by dotted path; uses a throwaway database",
    },
    { cmd: "python manage.py check", note: "system checks; add `--deploy` for production settings" },
  ],
  layout: [
    "The `DJANGO_SETTINGS_MODULE` value for dev and for tests, if they differ.",
    "Which apps are yours and which are vendored or third-party.",
    "Where the test runner is configured, if you use pytest-django instead of `manage.py test`.",
  ],
  rules: [
    "Commit a migration with the model change that needs it, in one commit.",
    "Generate migrations rather than writing them; say whether hand edits or squashing need a review.",
    "Use `sqlmigrate` to show the SQL of a risky migration before applying it.",
  ],
  sources: [
    "https://docs.djangoproject.com/en/stable/ref/django-admin/",
    "https://docs.djangoproject.com/en/stable/topics/migrations/",
    "https://docs.djangoproject.com/en/stable/topics/testing/overview/",
    "https://docs.djangoproject.com/en/stable/topics/settings/",
  ],
};
