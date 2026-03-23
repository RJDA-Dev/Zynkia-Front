import Badge from '../../components/ui/Badge'
import Card from '../../components/ui/Card'
import MockImage from '../../components/ui/MockImage'
import StatCard from '../../components/ui/StatCard'
import { portal } from '../../api/services'
import { useLang } from '../../context/LangContext'
import useCurrency from '../../hooks/useCurrency'
import useFetch from '../../hooks/useFetch'
import Spinner from '../../components/ui/Spinner'

export default function EmployeeInventoryPage() {
  const { lang } = useLang()
  const es = lang === 'es'
  const { formatCurrency } = useCurrency()
  const { data, loading } = useFetch(() => portal.inventory(), { key: 'portal-inventory' })
  const response = data || []
  const items = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : response?.data?.data || []
  const totalCost = items.reduce((sum, item) => sum + (Number(item.cost) || 0), 0)

  if (loading) return <Spinner />

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label={es ? 'Equipos' : 'Assets'} value={items.length} icon="inventory_2" />
        <StatCard label={es ? 'Portátiles' : 'Computers'} value={items.filter((i) => ['laptop', 'desktop'].includes(i.category)).length} icon="laptop_windows" iconColor="text-blue-600 bg-blue-50" />
        <StatCard label={es ? 'Periféricos' : 'Peripherals'} value={items.filter((i) => ['keyboard', 'monitor', 'mouse'].includes(i.category)).length} icon="devices" iconColor="text-success bg-success/10" />
        <StatCard label={es ? 'Valor kit' : 'Kit value'} value={formatCurrency(totalCost)} icon="payments" iconColor="text-amber-600 bg-amber-50" valueClassName="text-xl sm:text-2xl" />
      </div>

      <Card
        title={es ? 'Mi inventario asignado' : 'My assigned inventory'}
        subtitle={es ? 'Seriales, referencias y evidencias de tus equipos.' : 'Serials, references and evidence of your equipment.'}
      >
        {items.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <span className="material-symbols-outlined text-5xl">inventory</span>
            <p className="mt-3 text-sm">{es ? 'No tienes activos asignados.' : 'You have no assets assigned.'}</p>
          </div>
        ) : (
          <div className="space-y-4 p-4 sm:p-5">
            {items.map((asset) => (
              <article key={asset.id} className="overflow-hidden rounded-[--radius-lg] border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
                <div className="grid gap-0 sm:grid-cols-[160px_minmax(0,1fr)]">
                  <div className="relative min-h-[140px] sm:min-h-[180px] overflow-hidden">
                    {asset.photos?.[0]?.preview ? (
                      <img src={asset.photos[0].preview} alt={`${asset.brand} ${asset.model}`} className="h-full w-full object-cover" />
                    ) : (
                      <MockImage category={asset.category || asset.type} className="h-full w-full" />
                    )}
                  </div>
                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{asset.assetCode}</p>
                        <h3 className="mt-0.5 text-base font-bold text-slate-900 truncate">{asset.brand} {asset.model}</h3>
                        <p className="text-xs text-slate-500">{asset.serial}</p>
                      </div>
                      <Badge color="success">{es ? 'Asignado' : 'Assigned'}</Badge>
                    </div>

                    <div className="grid gap-2 grid-cols-2">
                      <div className="rounded-[--radius-sm] bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Tipo' : 'Type'}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900">{asset.type}</p>
                      </div>
                      <div className="rounded-[--radius-sm] bg-slate-50 px-3 py-2">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400">{es ? 'Ubicación' : 'Location'}</p>
                        <p className="mt-0.5 text-sm font-medium text-slate-900 truncate">{asset.location}</p>
                      </div>
                    </div>

                    {(asset.specs || []).length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {asset.specs.map((s) => (
                          <span key={s} className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">{s}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
