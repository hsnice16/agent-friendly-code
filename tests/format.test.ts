import { strict as assert } from "node:assert";
import { afterEach, beforeEach, describe, test } from "node:test";

import { compactStars, formatDate, hostLabel, relativeTime } from "../lib/utils/format";

describe("compactStars", () => {
  test("returns em-dash for null", () => {
    assert.equal(compactStars(null), "—");
  });

  test("formats small counts verbatim with suffix", () => {
    assert.equal(compactStars(7), "7 ★");
  });

  test("uses compact notation for thousands", () => {
    assert.equal(compactStars(1_200), "1.2k ★");
    assert.equal(compactStars(12_300), "12.3k ★");
  });

  test("uses compact notation for millions", () => {
    assert.equal(compactStars(1_500_000), "1.5m ★");
  });

  test("omits the star suffix when asked", () => {
    assert.equal(compactStars(1_200, false), "1.2k");
    assert.equal(compactStars(null, false), "—");
  });
});

describe("relativeTime", () => {
  const NOW = 1_700_000_000;
  let originalNow: () => number;

  beforeEach(() => {
    originalNow = Date.now;
    Date.now = () => NOW * 1000;
  });

  afterEach(() => {
    Date.now = originalNow;
  });

  test("seconds granularity under a minute", () => {
    assert.equal(relativeTime(NOW - 30), "30s ago");
  });

  test("minutes granularity under an hour", () => {
    assert.equal(relativeTime(NOW - 120), "2m ago");
    assert.equal(relativeTime(NOW - 59 * 60), "59m ago");
  });

  test("hours granularity under a day", () => {
    assert.equal(relativeTime(NOW - 2 * 3600), "2h ago");
  });

  test("days granularity at and beyond a day", () => {
    assert.equal(relativeTime(NOW - 86400), "1d ago");
    assert.equal(relativeTime(NOW - 7 * 86400), "7d ago");
  });

  test("never rounds up into the next unit's limit, nor below zero", () => {
    assert.equal(relativeTime(NOW - 59.6), "59s ago");
    assert.equal(relativeTime(NOW - 3599), "59m ago");
    assert.equal(relativeTime(NOW + 5), "0s ago");
  });
});

describe("hostLabel", () => {
  test("maps known hosts to human labels", () => {
    assert.equal(hostLabel("github"), "GitHub");
  });

  test("falls back to the input for unknown hosts", () => {
    assert.equal(hostLabel("sourcehut"), "sourcehut");
  });
});

describe("formatDate", () => {
  test("formats in UTC whatever the process zone", () => {
    const t = Date.UTC(2026, 9, 14, 23, 30) / 1000;
    assert.equal(formatDate(t), "14 Oct 2026");
    assert.equal(formatDate(t, { time: true }), "14 Oct 2026, 23:30 UTC");
  });
});
