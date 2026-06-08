import PageWrapper from '../components/layout/PageWrapper';
import StatsRow from '../components/progress/StatsRow';
import MileageChart from '../components/progress/MileageChart';
import LogTable from '../components/progress/LogTable';

export default function Progress() {
  return (
    <PageWrapper>
      <h1 className="font-display text-4xl tracking-widest">Progress</h1>

      <div className="mt-6">
        <StatsRow />
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">14-Week Mileage</p>
        <MileageChart />
      </div>

      <div className="mt-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-muted">Full Log</p>
        <LogTable />
      </div>
    </PageWrapper>
  );
}
