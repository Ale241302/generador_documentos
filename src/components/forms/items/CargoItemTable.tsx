import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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

export function CargoItemTable() {
    const { control, register, watch, setValue } = useFormContext();
    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    const handleWeightChange = (index: number, val: string) => {
        // Auto-copy to chargeable weight if empty? Or just manual.
        // Prompt says: "Peso Cobrable (copia Peso Bruto, editable)"
        const currentChargeable = watch(`items.${index}.chargeableWeight`);
        if (!currentChargeable) {
            setValue(`items.${index}.chargeableWeight`, val);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Box className="h-5 w-5 text-brand-primary" />
                    Detalle de Carga Aérea
                </h3>
                <Button
                    type="button"
                    onClick={() => append({ unit: 'kg' })}
                    className="bg-brand-primary hover:bg-brand-primary/90 text-white"
                >
                    <Plus className="h-4 w-4 mr-2" /> Agregar Ítem
                </Button>
            </div>

            <div className="space-y-4">
                {fields.map((field, index) => {
                    const item = field as Record<string, any>; // Type assertion to avoid implicit any error
                    const weight = watch(`items.${index}.chargeableWeight`);
                    const rate = watch(`items.${index}.rate`);
                    const total = (parseFloat(weight) || 0) * (parseFloat(rate) || 0);

                    return (
                        <Card key={field.id} className="relative overflow-hidden border-l-4 border-l-brand-primary/50">
                            <CardContent className="p-4 grid gap-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    <div className="space-y-2">
                                        <Label>N° de Piezas</Label>
                                        <Input {...register(`items.${index}.pieces`)} placeholder="0" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Peso Bruto</Label>
                                        <Input
                                            {...register(`items.${index}.grossWeight`)}
                                            placeholder="0.00"
                                            onChange={(e) => {
                                                register(`items.${index}.grossWeight`).onChange(e);
                                                handleWeightChange(index, e.target.value);
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Unidad</Label>
                                        <RadioGroup
                                            onValueChange={(v) => setValue(`items.${index}.unit`, v)}
                                            defaultValue={item.unit || 'kg'}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="kg" id={`unit-kg-${index}`} />
                                                <Label htmlFor={`unit-kg-${index}`}>kg</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="lb" id={`unit-lb-${index}`} />
                                                <Label htmlFor={`unit-lb-${index}`}>lb</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Clase de Tarifa</Label>
                                        <Input {...register(`items.${index}.rateClass`)} placeholder="ej: K" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-2">
                                        <Label>Peso Cobrable</Label>
                                        <Input {...register(`items.${index}.chargeableWeight`)} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Tarifa (Rate)</Label>
                                        <Input {...register(`items.${index}.rate`)} placeholder="0.00" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Total (Cálculo)</Label>
                                        <div className="p-2 bg-brand-primary/10 rounded font-bold text-brand-primary text-right">
                                            {total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Descripción y Dimensiones</Label>
                                    <Textarea {...register(`items.${index}.description`)} rows={2} placeholder="Descripción de la carga..." />
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
                                                <AlertDialogTitle>¿Eliminar ítem?</AlertDialogTitle>
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
                    );
                })}
            </div>
        </div>
    );
}
