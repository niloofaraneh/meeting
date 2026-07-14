import { getUnitTree } from "@/modules/units/unit.service";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { NewUnitForm } from "@/components/units/NewUnitForm";

function UnitNode({ unit, depth = 0 }: { unit: any; depth?: number }) {
  return (
    <div>
      <div
        className="flex items-center justify-between p-3 rounded-xl hover:bg-navy-50/50"
        style={{ marginRight: depth * 20 }}
      >
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: unit.colorHex }} />
          <span className="text-sm font-medium text-navy-800">{unit.name}</span>
          <span className="text-xs text-navy-300">کد: {unit.code}</span>
        </div>
        <Badge color={unit.colorHex}>{unit._count?.users ?? unit.users?.length ?? 0} نفر</Badge>
      </div>
      {unit.children?.map((c: any) => (
        <UnitNode key={c.id} unit={c} depth={depth + 1} />
      ))}
    </div>
  );
}

export default async function UnitsPage() {
  const tree = await getUnitTree();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-navy-800">واحدهای سازمانی</h1>
        <p className="text-sm text-navy-400 mt-1">تعریف واحدها و سلسله‌مراتب بین آن‌ها؛ هر واحد یک کد اختصاصی برای شماره‌گذاری صورتجلسات دارد</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <h2 className="text-sm font-bold text-navy-800 mb-3">ساختار واحدها</h2>
          <div className="space-y-1">
            {tree.map((u: any) => <UnitNode key={u.id} unit={u} />)}
          </div>
        </Card>
        <Card>
          <h2 className="text-sm font-bold text-navy-800 mb-3">افزودن واحد جدید</h2>
          <NewUnitForm parentOptions={tree} />
        </Card>
      </div>
    </div>
  );
}
