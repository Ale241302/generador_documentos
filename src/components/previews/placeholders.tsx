export function BillOfLadingPreview({ variant }: { variant: 'original' | 'export' }) { return <div className="p-4 border">Vista Previa BL ({variant})</div>; }
export function AirWaybillPreview() { return <div className="p-4 border">Vista Previa AWB</div>; }
export function CargoManifestPreview() { return <div className="p-4 border">Vista Previa Manifiesto</div>; }
