import type { Config, TeamRosterYear } from '../types.js';

const SEASON_RE = /^\d{4}-\d{2}$/;

export function isValidSeasonFormat(season: string): boolean {
  return SEASON_RE.test(season);
}

function computeAcademicSeason(now: Date, rolloverMonth: number, rolloverDay: number): string {
  const month = now.getUTCMonth() + 1;
  const day = now.getUTCDate();
  let startYear = now.getUTCFullYear();
  if (month < rolloverMonth || (month === rolloverMonth && day < rolloverDay)) {
    startYear -= 1;
  }
  const endShort = (startYear + 1) % 100;
  return `${startYear}-${String(endShort).padStart(2, '0')}`;
}

export function resolveSeasonForTeam(team: TeamRosterYear, config: Config, now: Date): string {
  if (config.seasonOverride) {
    return config.seasonOverride;
  }
  const fromApi = (team.roster_year_orig ?? '').trim();
  if (fromApi && isValidSeasonFormat(fromApi)) {
    return fromApi;
  }
  return computeAcademicSeason(now, config.academicYearRolloverMonth, config.academicYearRolloverDay);
}
