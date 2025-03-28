'use client';
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { paymentMethodSchema } from "@/lib/validator";
import { z } from "zod";
import {  useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DEFAULT_PAYMENT_METHOD, PAYMENT_METHODS } from "@/lib/constants";
import { Form,FormControl, FormField, FormItem, FormLabel, FormMessage   } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateUserPaymentMethod } from "@/lib/actions/user.actions";
import { toast } from "sonner";


const PaymentMethodForm = ({preferredPaymentMethod}:{preferredPaymentMethod:string | null}) => {
    const router = useRouter();

    const form = useForm<z.infer<typeof paymentMethodSchema>>({
        resolver: zodResolver(paymentMethodSchema),
        defaultValues: {
            type: preferredPaymentMethod || DEFAULT_PAYMENT_METHOD,
        },
    });

    const [isPending, startTransition] = useTransition();
    
    const onSubmit = async (values:z.infer<typeof paymentMethodSchema>) => {
        startTransition(async () => {
            console.log(values);
            const res = await updateUserPaymentMethod(values);
            if(!res.success) {
                toast.error(res.message);
                return;
            } 
            router.push('/place-order'); 
        }) 
        return;
    }

    return <>
        <div className="max-w-md mx-auto space-y-4">
            <h1 className="h2-bold mt-4">Payment Method</h1>
            <p className="text-sm text-muted-foreground">Please select a payment method</p>
            
            <Form {...form}>
                <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="flex flex-col md:flex-row gap-5">
                        <FormField
                            control={form.control}
                            name="type"
                            render={({field}) => (
                                <FormItem className="space-y-3">
                                    <FormControl>
                                        <RadioGroup 
                                        onValueChange={field.onChange} 
                                        className="flex flex-col space-y-2" >
                                            {PAYMENT_METHODS.map((method) => (
                                                <FormItem 
                                                key={method}  
                                                className="flex items-center space-x-3" >
                                                        <FormControl>
                                                            <RadioGroupItem 
                                                            value={method}
                                                            checked={field.value === method}
                                                            />
                                                        </FormControl>
                                                        <FormLabel className="font-normal">
                                                            {method}
                                                        </FormLabel>
                                                    </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                   
                    <div className="flex gap-2">
                        <Button type="submit"  disabled={isPending}>
                            {isPending ? (
                                <Loader className=" h-4 w-4 animate-spin" />
                            ) : (
                                <ArrowRight className="h-4 w-4" />
                            )}{''} 
                            Continue
                        </Button>
                    </div>
                </form>
            </Form>
           
        </div>
    </>
}
 
export default PaymentMethodForm;