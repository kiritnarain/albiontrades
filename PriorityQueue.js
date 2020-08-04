//Max heap priority queue
class PriorityQueue {


    constructor() {
        this.array = [];
        this.size = 0;
    }


    /**
     * Insert item into the priority queue
     * @param pNode -> PriorityNode for given item
     */
    add(pNode){
        if(this.size===0){
            this.array[0] = pNode;
            this.size++;
            return;
        }

        this.array[this.size] = pNode;
        var index = this.swim(this.size);
        this.size++;
    }

    //Attempt to move element at index up priority queue based on priority
    swim(index){
        var parentIndex = Math.floor((index-1)/2);
        if(parentIndex>=0){
            if(this.array[parentIndex].profit<this.array[index].profit){
                this.swap(index, parentIndex);
                return this.swim(parentIndex);
            }
        }
        return index;
    }

    /**
     *
     * @param i1 - index of first element
     * @param i2 - index of second element
     */
    swap(i1, i2){
        var temp = this.array[i1];
        this.array[i1] = this.array[i2];
        this.array[i2] = temp;
    }

    /**
     * Removes and returns the highest priority item in the queue.
     */
    remove(){
        if(this.size===0){
            return null;
        }

        var maxItem = this.array[0];
        this.swap(0, this.size-1);
        this.array[this.size-1] = null;
        this.size--;
        this.sink(0);
        return maxItem;
    }

    sink(index){
        var leftChild = index*2+1;
        var rightChild = index*2+2;
        var rightValid = rightChild<this.size && this.array[rightChild]!=null;
        var leftValid = leftChild<this.size && this.array[leftChild]!=null;
        if(rightValid && leftValid){
            if(this.array[leftChild].profit>this.array[index].profit && this.array[leftChild].profit>=this.array[rightChild].profit){
                this.swap(index, leftChild);
                this.sink(leftChild);
            }else if(this.array[rightChild].profit>this.array[index].profit && this.array[rightChild].profit > this.array[leftChild].profit){
                this.swap(index, rightChild);
                this.sink(rightChild);
            }
        }else if(rightValid && this.array[rightChild].profit>this.array[index].profit){
            this.swap(index, rightChild);
            this.sink(rightChild);
        }else if(leftValid && this.array[leftChild].profit>this.array[index].profit){
            this.swap(index, leftChild);
            this.sink(leftChild);
        }
    }

    isEmpty(){
        return this.size===0;
    }
}
module.exports = PriorityQueue;