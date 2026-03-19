import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Container } from "lucide-react";
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

export function ManifestItemTable() {
    const { control, register } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "houses",
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Container className="h-5 w-5 text-brand-primary" />
                    Detalle de Guías Hija (House BLs)
                </h3>
                <Button
                    type="button"
                    onClick={() => append({})}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" /> Agregar Guía
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((item, index) => (
                    <Card key={item.id} className="relative overflow-hidden border-l-4 border-l-brand-primary/50">
                        <CardContent className="p-4 grid gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>House B/L No.</Label>
                                    <Input {...register(`houses.${index}.houseNumber`)} placeholder="Número de House" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Embarcador (Shipper)</Label>
                                    <Input {...register(`houses.${index}.shipper`)} placeholder="Nombre del Embarcador" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Consignatario (Consignee)</Label>
                                    <Input {...register(`houses.${index}.consignee`)} placeholder="Nombre del Consignatario" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="space-y-2">
                                    <Label>Bultos</Label>
                                    <Input {...register(`houses.${index}.packages`)} placeholder="Cant." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unidad</Label>
                                    <Input {...register(`houses.${index}.unit`)} placeholder="ej: CT, PLT" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Peso (Kg)</Label>
                                    <Input {...register(`houses.${index}.weight`)} placeholder="0.00" />
                                </div>
                                <div className="space-y-2">
                                    <Label>Volumen (m³)</Label>
                                    <Input {...register(`houses.${index}.volume`)} placeholder="0.00" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Descripción de Mercaderías</Label>
                                    <Textarea {...register(`houses.${index}.description`)} rows={2} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Aduana USA / Notas</Label>
                                    <Input {...register(`houses.${index}.usCustoms`)} placeholder="Información aduanera" />
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" size="sm">
                                            <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar House?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Esta acción no se puede deshacer.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => remove(index)}>Eliminar</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
