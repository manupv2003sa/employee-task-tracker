import { Injectable, signal } from '@angular/core';


export interface  ToastMessage{
    id: number,
    type: 'success'| 'error' | 'warning' | 'info';
    message: string,
}

@Injectable({
    providedIn:'root'
})
export class ToastService {
    toasts = signal <ToastMessage[]>([]);

    private nextId =1;


    success(message : string):void{
        this.show('success', message);
    }

    error(message:string):void{
        this.show('error',message);
    }


    private show(type:ToastMessage['type'],
                 message:string
    ):void{
        const toast : ToastMessage={
            id:this.nextId++,
            type,
            message,
        };

        this.toasts.update(current=> [...current,toast]);

        setTimeout(()=>{
            this.remove(toast.id);
        },4000);
    }
    remove(id:number):void{
        this.toasts.update(current=>
            current.filter(toasts=>toasts.id !==id)
        );
    }
}
