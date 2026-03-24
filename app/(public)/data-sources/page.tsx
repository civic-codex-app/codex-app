import type { Metadata } from 'next'
import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

export const metadata: Metadata = {
  title: 'Data Sources & Disclaimer | Poli',
  description:
    'Where Poli gets its data: public government sources, official records, and how we verify political information.',
}

const SOURCES = [
  {
    category: 'Politician Profiles & Biographical Data',
    items: [
      {
        name: 'Congress.gov',
        url: 'https://www.congress.gov',
        description:
          'Official source for member biographies, committee assignments, and legislative activity for U.S. Senators and Representatives.',
      },
      {
        name: 'Congress.gov API',
        url: 'https://api.congress.gov',
        description:
          'Official Library of Congress API used to seed current member data, including all 435 House Representatives, 100 Senators, and official portrait photos.',
      },
      {
        name: 'Official Government Websites',
        url: null,
        description:
          'State legislature websites, governor offices, and municipal government sites for state and local officials.',
      },
      {
        name: 'Ballotpedia',
        url: 'https://ballotpedia.org',
        description:
          'Nonpartisan political encyclopedia used for candidate information, election data, and local office holder details.',
      },
    ],
  },
  {
    category: 'Voting Records & Legislative Activity',
    items: [
      {
        name: 'Congress.gov API',
        url: 'https://api.congress.gov',
        description:
          'Official API provided by the Library of Congress for roll call votes, bill text, and legislative actions.',
      },
      {
        name: 'Senate.gov & House.gov',
        url: null,
        description:
          'Official roll call vote records published by the U.S. Senate and House of Representatives.',
      },
    ],
  },
  {
    category: 'Campaign Finance',
    items: [
      {
        name: 'Federal Election Commission (FEC)',
        url: 'https://www.fec.gov',
        description:
          'Official source for federal campaign finance data including contributions, expenditures, and PAC filings.',
      },
      {
        name: 'FEC OpenFEC API',
        url: 'https://api.open.fec.gov',
        description:
          'Public API providing real-time campaign finance data for 3,700+ active candidates — total receipts, disbursements, cash on hand, and FEC filing links. Updated as new filings are submitted.',
      },
    ],
  },
  {
    category: 'Election Data & Results',
    items: [
      {
        name: 'State Election Offices',
        url: null,
        description:
          'Official Secretary of State websites for certified election results, candidate filings, and ballot information.',
      },
      {
        name: 'Associated Press (AP)',
        url: null,
        description:
          'Historical election results and race calls used as reference for past election outcomes.',
      },
    ],
  },
  {
    category: 'Issue Stances & Policy Positions',
    items: [
      {
        name: 'Official Statements & Press Releases',
        url: null,
        description:
          'Public statements, press releases, and official policy positions published by politicians and their offices.',
      },
      {
        name: 'Congressional Record',
        url: 'https://www.congress.gov/congressional-record',
        description:
          'Official record of floor speeches, debates, and statements made by members of Congress.',
      },
      {
        name: 'Campaign Websites',
        url: null,
        description:
          'Official campaign websites and policy platforms published by candidates during election cycles.',
      },
      {
        name: 'Party Platform Defaults',
        url: null,
        description:
          'Where individual stance data is unavailable, estimated positions are derived from official party platforms. These are clearly marked as "Estimated" and not "Verified."',
      },
    ],
  },
  {
    category: 'News & Media Bias',
    items: [
      {
        name: 'Google News RSS',
        url: 'https://news.google.com',
        description:
          'Aggregated news headlines used to surface recent coverage about politicians from multiple outlets.',
      },
      {
        name: 'Media Bias/Fact Check (MBFC)',
        url: 'https://mediabiasfactcheck.com',
        description:
          'Bias ratings for 6,000+ news sources used to classify articles as left-leaning, center, or right-leaning. Ratings sourced via the MBFC API.',
      },
    ],
  },
  {
    category: 'Photos & Media',
    items: [
      {
        name: 'Official Congressional Portraits',
        url: null,
        description:
          'Official photos provided by congressional offices and government agencies.',
      },
      {
        name: 'Wikimedia Commons',
        url: 'https://commons.wikimedia.org',
        description:
          'Public domain and Creative Commons licensed images used under applicable licenses with attribution.',
      },
      {
        name: 'Open States',
        url: 'https://openstates.org',
        description:
          'State legislator data and official portrait photos sourced via the Open States API for state-level officials.',
      },
      {
        name: 'unitedstates/images (GitHub)',
        url: 'https://github.com/unitedstates/images',
        description:
          'Public domain congressional photos maintained by the @unitedstates project, used for federal officials.',
      },
      {
        name: 'Wikidata',
        url: 'https://www.wikidata.org',
        description:
          'Structured data repository used to find additional politician photos via SPARQL queries.',
      },
    ],
  },
  {
    category: 'State & Local Officials',
    items: [
      {
        name: 'Open States API',
        url: 'https://openstates.org',
        description:
          'Primary source for state legislator data including names, parties, districts, committees, and contact information across all 50 states.',
      },
      {
        name: 'Civic Information API',
        url: 'https://developers.google.com/civic-information',
        description:
          'Google Civic Information API used for address-based representative lookups and local official data.',
      },
    ],
  },
]

export default function DataSourcesPage() {
  return (
    <>
      <Header />
      <div className="mx-auto max-w-[1200px] px-6 pt-6 md:px-10">
        <h1 className="mb-2 text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-tight text-[var(--poli-text)]">
          Data Sources & Disclaimer
        </h1>
        <p className="mb-10 max-w-2xl text-[14px] leading-relaxed text-[var(--poli-sub)]">
          Poli is committed to transparency — not just about politicians, but about where our
          information comes from. Below is a complete list of the public data sources we use to
          compile the information on this platform.
        </p>

        {/* Sources */}
        <div className="space-y-10">
          {SOURCES.map((section) => (
            <div key={section.category}>
              <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-lg border border-[var(--poli-border)] p-4"
                  >
                    <div className="flex items-center gap-2">
                      <h3 className="text-[14px] font-semibold text-[var(--poli-text)]">
                        {item.name}
                      </h3>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-500 hover:underline"
                        >
                          ↗
                        </a>
                      )}
                    </div>
                    <p className="mt-1 text-[13px] leading-relaxed text-[var(--poli-sub)]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-14 rounded-xl border border-[var(--poli-border)] bg-[var(--poli-card)] p-6">
          <h2 className="mb-4 text-[12px] font-medium uppercase tracking-[0.15em] text-[var(--poli-sub)]">
            Legal Disclaimer
          </h2>
          <div className="space-y-4 text-[13px] leading-relaxed text-[var(--poli-sub)]">
            <p>
              <strong className="text-[var(--poli-text)]">Accuracy.</strong>{' '}Poli strives
              for accuracy but makes no warranties or guarantees regarding the completeness,
              reliability, or currentness of any information presented on this platform. Political
              positions, voting records, and other data may change at any time. Information marked
              as &ldquo;Estimated&rdquo; is derived from party platform defaults and has not been
              individually verified.
            </p>
            <p>
              <strong className="text-[var(--poli-text)]">Not Legal or Political Advice.</strong>{' '}
              The information on Poli is provided for educational and informational purposes only.
              It does not constitute legal, political, or professional advice. Users should
              independently verify any information before relying on it for voting decisions or
              other purposes.
            </p>
            <p>
              <strong className="text-[var(--poli-text)]">Independence.</strong>{' '}Poli is an
              independent civic education platform. We are not affiliated with, endorsed by, or
              funded by any political party, political action committee (PAC), campaign, government
              agency, or elected official. We do not endorse any candidate or political position.
            </p>
            <p>
              <strong className="text-[var(--poli-text)]">Public Data.</strong>{' '}All information
              presented on this platform is compiled from publicly available sources as listed
              above. We respect all applicable intellectual property rights and use data in
              accordance with fair use principles and applicable terms of service.
            </p>
            <p>
              <strong className="text-[var(--poli-text)]">User Contributions.</strong>{' '}Community
              annotations and corrections submitted by users reflect the views of their authors,
              not the views of Poli. User-submitted content is reviewed before publication but
              Poli does not guarantee its accuracy.
            </p>
            <p>
              <strong className="text-[var(--poli-text)]">Contact.</strong>{' '}If you believe any
              information on Poli is inaccurate or if you are an elected official and would like
              to update your information, please contact us. We are committed to correcting errors
              promptly.
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-[12px] text-[var(--poli-faint)]">
          Last updated: March 2026
        </p>

        <Footer hideDisclaimer />
      </div>
    </>
  )
}
