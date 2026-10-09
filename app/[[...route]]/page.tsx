import { notFound } from 'next/navigation';
import { portfolioMarkup } from '../portfolio-markup';
import { PortfolioRuntime } from '../portfolio-runtime';
export default async function Page({ params }: { params: Promise<{ route?: string[] }> }) {
  const { route = [] } = await params;
  if(route.length > 1 || (route.length === 1 && route[0] !== 'work'))notFound();
  return <><div id="portfolio-root" dangerouslySetInnerHTML={{ __html: portfolioMarkup }} /><PortfolioRuntime /></>;
}
