class ForwardLinkedNode<T> {
    public value: T;
    public next: ForwardLinkedNode<T> | null;
    public anchor: ForwardLinkedNode<number> | null;
    public constructor(value: T, anchor: ForwardLinkedNode<number> | null = null) {
        this.value = value;
        this.anchor = anchor;
        this.next = null;
    }
}

export class ForwardLinkedList<T> {
    private readonly anchor: ForwardLinkedNode<number>;
    private genesis: ForwardLinkedNode<T> | null;
    private last: ForwardLinkedNode<T> | null;
    private len: number;

    public constructor() {
        this.genesis = null;
        this.last = null;
        this.anchor = new ForwardLinkedNode<number>(0);
        this.len = 0;
    }
    public length(): number {
        return this.len;
    }
    public append(value: T) {
        const newNode = new ForwardLinkedNode<T>(value, this.anchor);
        if (this.last === null){
            this.genesis = newNode;
            this.last = newNode;
        } else {
            this.last.next = newNode;
            this.last = newNode;
        }
        this.len++;
    }
    public appendFront(value: T){
        const newNode = new ForwardLinkedNode<T>(value, this.anchor);
        newNode.next = this.genesis;
        this.genesis = newNode;
        this.len++;
    }
    public appendAfter(block: ForwardLinkedNode<T>, value: T): boolean {
        if (block.anchor !== this.anchor) return false;
        const newNode = new ForwardLinkedNode<T>(value, this.anchor);
        newNode.next = block.next;
        block.next = newNode;
        if (block === this.last) this.last = newNode;
        this.len++;
        return true;
    }
    public removeFirst(): boolean {
        if (this.genesis === null) return false;
        if (this.genesis === this.last) this.last = null;
        this.genesis.next = null;
        this.genesis.anchor = null;
        this.genesis = null;
        this.len--;
        return true;
    }
    public removeAfter(block: ForwardLinkedNode<T>): boolean {
        if (block.anchor !== this.anchor) return false;
        const removalTarget = block.next;
        if (removalTarget !== null){
            if (removalTarget === this.last) this.last = null;
            block.next = removalTarget.next;
            removalTarget.next = null;
            removalTarget.anchor = null;
        } else {
            block.next = null;
        }
        this.len--;
        return true;
    }
    public map<U>(callback: (last: ForwardLinkedNode<T> | null, node: ForwardLinkedNode<T>, index: number) => U): U[]{

        let iter = this.genesis;
        let last = null;
        let count = 0
        let re: U[] = [];
        while (iter !== null){
            const callbackResult = callback(last, iter, count);
            re = re.concat(callbackResult);
            last = iter;
            iter = iter.next;
            count++;
        }
        return re;
    }
    public mapNoReturn(callback: (last: ForwardLinkedNode<T> | null, node: ForwardLinkedNode<T>, index: number) => void): void{

        let iter = this.genesis;
        let last = null;
        let count = 0
        while (iter !== null){
            callback(last, iter, count);
            last = iter;
            iter = iter.next;
            count++;
        }
    }
    public duplicate(){
        const re = new ForwardLinkedList<T>();
        this.mapNoReturn((_last, curr, _index)=>{
            re.append(curr.value);
        })
        return re;
    }
    public toArray(): T[] {
        return this.map<T>((_last: ForwardLinkedNode<T> | null, node: ForwardLinkedNode<T>, _index: number) => {
            return node.value;
        });
    }
    public toString(): string {
        return this.toArray().toString();
    }
}

