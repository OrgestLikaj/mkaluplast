import { getProducts, site } from './content';
import { useTranslations, type Lang } from '../i18n/ui';

export type Stat = { value: string; label: string };

/**
 * Company figures derived from real data (founding year, product and partner
 * counts) so they stay accurate as content changes. Shared by Home and About.
 */
export async function companyStats(lang: Lang, foundedYear?: number): Promise<Stat[]> {
  const t = useTranslations(lang);
  const products = await getProducts(lang);
  const stats: (Stat | false | undefined | 0)[] = [
    foundedYear && { value: String(foundedYear), label: t('about.founded') },
    // Round down to a multiple of 5 ("25+") so the claim holds whatever month they started.
    foundedYear && {
      value: `${Math.floor((new Date().getFullYear() - foundedYear) / 5) * 5}+`,
      label: t('about.years'),
    },
    products.length > 0 && { value: String(products.length), label: t('about.lines') },
    site.partners.length > 0 && { value: String(site.partners.length), label: t('about.partners') },
  ];
  return stats.filter(Boolean) as Stat[];
}
