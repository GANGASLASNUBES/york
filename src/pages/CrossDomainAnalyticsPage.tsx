import { TrendingUp, Users, DollarSign, MousePointerClick } from 'lucide-react';

type DomainStats = {
  code: string;
  name: string;
  color: string;
  traffic: number;
  revenue: number;
  engagement: number;
  conversion: number;
};

const DOMAINS: DomainStats[] = [
  { code: 'LEXI_SITE', name: 'LexiRose.ca', color: 'rose', traffic: 45230, revenue: 24580, engagement: 72, conversion: 4.2 },
  { code: 'BIPS_SITE', name: 'BipsMontreal.com', color: 'emerald', traffic: 12840, revenue: 8940, engagement: 58, conversion: 2.8 },
  { code: 'GEAR_SITE', name: 'BipsGear.com', color: 'amber', traffic: 18520, revenue: 42310, engagement: 65, conversion: 6.1 },
];

const colorClasses: Record<string, { bar: string; text: string; bg: string }> = {
  rose: { bar: 'bg-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
  emerald: { bar: 'bg-emerald-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  amber: { bar: 'bg-amber-500', text: 'text-amber-600', bg: 'bg-amber-50' },
};

export function CrossDomainAnalyticsPage() {
  const maxTraffic = Math.max(...DOMAINS.map((d) => d.traffic));
  const maxRevenue = Math.max(...DOMAINS.map((d) => d.revenue));
  const totalTraffic = DOMAINS.reduce((s, d) => s + d.traffic, 0);
  const totalRevenue = DOMAINS.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Cross-Domain Analytics</h1>
        <p className="text-gray-600">Compare performance across all three ecosystem properties.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <Users className="text-gray-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-gray-900">{totalTraffic.toLocaleString()}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Visitors</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <DollarSign className="text-gray-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Total Revenue</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <TrendingUp className="text-gray-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-gray-900">
            {Math.round((DOMAINS.reduce((s, d) => s + d.engagement, 0) / DOMAINS.length))}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Avg Engagement</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200">
          <MousePointerClick className="text-gray-400 mb-2" size={20} />
          <div className="text-2xl font-bold text-gray-900">
            {(DOMAINS.reduce((s, d) => s + d.conversion, 0) / DOMAINS.length).toFixed(1)}%
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Avg Conversion</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Traffic by Domain</h2>
        <div className="space-y-4">
          {DOMAINS.map((d) => {
            const c = colorClasses[d.color];
            return (
              <div key={d.code}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium text-gray-900">{d.name}</span>
                  <span className="text-sm text-gray-600">{d.traffic.toLocaleString()} visits</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.bar} rounded-full transition-all`}
                    style={{ width: `${(d.traffic / maxTraffic) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Revenue by Domain</h2>
        <div className="space-y-4">
          {DOMAINS.map((d) => {
            const c = colorClasses[d.color];
            return (
              <div key={d.code}>
                <div className="flex justify-between items-baseline mb-2">
                  <span className="font-medium text-gray-900">{d.name}</span>
                  <span className="text-sm text-gray-600">${d.revenue.toLocaleString()}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${c.bar} rounded-full transition-all`}
                    style={{ width: `${(d.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {DOMAINS.map((d) => {
          const c = colorClasses[d.color];
          return (
            <div key={d.code} className={`${c.bg} rounded-xl p-6 border border-gray-200`}>
              <h3 className={`font-semibold ${c.text} mb-4`}>{d.name}</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Engagement</div>
                  <div className="text-xl font-bold text-gray-900">{d.engagement}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Conversion</div>
                  <div className="text-xl font-bold text-gray-900">{d.conversion}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-600 mb-0.5">Revenue per Visit</div>
                  <div className="text-xl font-bold text-gray-900">
                    ${(d.revenue / d.traffic).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
