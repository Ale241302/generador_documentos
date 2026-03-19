import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function ContainerTable() {
    const { control, register, watch } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "containers",
    });

    // Calculate totals
    const containers = watch("containers") || [];
    const totalPackages = containers.reduce((acc: number, curr: any) => acc + (Number(curr.packageCount) || 0), 0);
    const totalWeight = containers.reduce((acc: number, curr: any) => acc + (Number(curr.grossWeight) || 0), 0);
    const totalMeasure = containers.reduce((acc: number, curr: any) => acc + (Number(curr.measurement) || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5 text-brand-primary" />
                    Detalle de Carga
                </h3>
                <Button
                    type="button"
                    onClick={() => append({})}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" /> Agregar Contenedor
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((item, index) => (
                    <Card key={item.id} className="relative overflow-hidden border-l-4 border-l-brand-primary/50">
                        <CardContent className="p-4 grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>N° Contenedor / Marcas</Label>
                                    <Input {...register(`containers.${index}.containerNumber`)} placeholder="ej: SEGU3573134" />
                                </div>
                                <div className="space-y-2">
                                    <Label>N° Sello (SEAL)</Label>
                                    <Input {...register(`containers.${index}.sealNumber`)} placeholder="ej: HLC09804" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Cantidad de Bultos</Label>
                                    <Input {...register(`containers.${index}.packageCount`)} type="number" placeholder="ej: 20" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tipo de Embalaje</Label>
                                    <Input {...register(`containers.${index}.packageType`)} placeholder="ej: 20 Ft. Standard Container" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Descripción de la Mercancía</Label>
                                <Textarea
                                    {...register(`containers.${index}.description`)}
                                    rows={3}
                                    placeholder="Descripción detallada..."
                                    className="resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Peso Bruto (Kg)</Label>
                                    <Input {...register(`containers.${index}.grossWeight`)} type="number" step="0.01" placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Medidas (m³)</Label>
                                    <Input {...register(`containers.${index}.measurement`)} type="number" step="0.01" placeholder="0.00" />
                                </div>
                                <div className="flex items-end justify-end">
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" size="sm" className="w-full md:w-auto">
                                                <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta acción eliminará el contenedor y sus datos.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => remove(index)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                    Eliminar
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {fields.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-brand-primary/10 rounded-lg border border-brand-primary/20">
                    <div className="flex flex-col">
                        <span className="text-sm text-brand-primary font-medium">📦 Total Bultos</span>
                        <span className="text-xl font-bold">{totalPackages}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-brand-primary font-medium">⚖️ Total Peso</span>
                        <span className="text-xl font-bold">{totalWeight.toLocaleString('es-CL', { minimumFractionDigits: 2 })} Kg</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm text-brand-primary font-medium">📐 Total Medidas</span>
                        <span className="text-xl font-bold">{totalMeasure.toLocaleString('es-CL', { minimumFractionDigits: 2 })} m³</span>
                    </div>
                </div>
            )}
        </div>
    );
}
