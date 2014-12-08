
/**
 * 双向链表
 */
var DuLinkedList = function(){
	this.firstNode = null;
	this.lastNode = null;
	this.currentNode = null;
	this.size = 0;
}
/**
 * 节点
 */
var ListNode = function(){
	this.prev = null;
	this.data = null;
	this.next = null;
}
/**
 * 链表的动作
 */
DuLinkedList.prototype = {
	/**
	 * 在末尾添加一个节点
	 */
	add: function(data){
		
	},
	/**
	 * 在某个节点后插入一个节点
	 */
	insertTo: function(node,data){
		
	},
	insertBefore: function(node,data){
		
	},
	remove: function(node){
		
	},
	getData: function(node){
		return node.data;
	},
	setData: function(node,data){
		node.data = data;
		return node;
	},
	indexOf: function(data) {
		var currentNode = this.firstNode;
		var position = 0;
		var found = false;
		for (; ; position++) {
			if (currentNode == null) {
					break;
			}
			if (data == currentNode.data) {
					found = true;
					break;
			}
			currentNode = currentNode.next;
		}
		if (!found) {
			position = -1;
		}
		return position;
	},
	getNode: function(data){
		var currentNode = this.firstNode;
		var position = 0;
		var found = false;
		for (; ; position++) {
			if (currentNode == null) {
					break;
			}
			if (data == currentNode.data) {
					found = true;
					break;
			}
			currentNode = currentNode.next;
		}
		if (!found) {
			currentNode = null;
		}
		return currentNode;
	}
}



/**
* 双方向リスト構造
*/
var List = function(){
    'use strict'
    // コンストラクタ

    // ダミーノードを設定
    this.dummy = new Node();

    // 最初は次も前の自分自身
    this.dummy.prev = this.dummy;
    this.dummy.next = this.dummy;

    // 現在注目しているノード
    this.curNode = this.dummy;

    // Listの長さを保持しておく
    this.length = 0;
}
List.prototype = {
    /**
    *List.push(data)
    *   ノードの最後尾に要素を追加します
    *@param  {Object} data
    *@return {Object} node
    */
    push: function(data){
        // 新しい要素を作成
        var node = new Node(data, this.get(this.length - 1), this.dummy.next);

        // ノードのつなぎを変更
        // 1. "新しく追加した要素の前の要素"の次参照を新しく追加する要素に設定
        // 2. ダミー要素の前参照を新しく追加する要素に設定
        node.prev.next = node;
        this.dummy.prev = node;

        // 長さを増やす
        this.length++;
    },
    /**
    *List.pop()
    *   ノードの最後尾を取り出し、値を返す
    *@return {Object} data
    */
    pop: function(){
        // 取り出す要素を格納
        var node = this.dummy.prev;
        // データを格納
        var data = node.data;

        // ノードのつなぎを変更
        // 1. ダミー要素の前参照をターゲット要素の前参照に変更
        // 2. "ターゲット要素の前の要素"の次参照をダミー要素に変更
        this.dummy.prev = node.prev;
        node.prev.next = this.dummy;

        // 長さを減らす
        this.length--;

        return data;
    },
    /**
    *List.get(n)
    *   n番目の要素を取得します
    *@param  {int}    n
    *@return {Object} node
    */
    get: function(n){
        // 先頭の要素を0番目に設定
        var node = this.dummy.next;

        // n番目の要素を取り出します
        for(var i = 0; i < n; i++){
            node = node.next;
        }

        return node;
    },
    /**
    *List.getData(n)
    *   n番目の要素の値を取得します
    *@param  {int}    n
    *@return {Object} data
    */
    getData: function(n){
        // List.get(n)で対象要素を取得し、そのデータを返す
        return this.get(n).data;
    },
    /**
    *List.set(n)
    *   n番目の要素の値を変更します
    *@param  {Object} data
    *@param  {int}    n
    */
    setData:function(data,n){
        var node = this.get(n);
        node.data = data;
    },
    /**
    *Lsit.getAllData()
    *   ノードに格納されたデータ全てを配列で返します
    **/
    getAllData: function(){
        // 返却用の配列
        var listArray = [];
        var node = this.dummy.next
        for(var i = 0; i < this.length; i++){
            listArray.push(node.data);
            node = node.next;
        }
        return listArray;
    },
    /**
    *List.forEach(func);
    *   ノードの要素を回します
    *@param {function} func(data,index)
    */
    forEach: function(func){
        //最初の要素
        var node = this.dummy.next;
        for(var i = 0; i < this.length; i++){
            func(node.data,i);
            node = node.next;
        }
    },
    /**
    *List.insertTo(data,n)
    *   n番目の要素の前に要素を追加します
    *@param {Object} data
    *@param {int}    n
    */
    insertTo: function(data,n){
        var node = this.get(n);

        // 新しい要素を作成し、ノードのつなぎを変更
        // 1. "n番目の要素の前の要素"の次参照が新しい要素
        // 2. "n番目の要素"の前参照が新しい要素
        var newNode = new Node(data,node.prev,node);
        node.prev.next = newNode;
        node.prev      = newNode;

        // 長さを増やす
        this.length++;
    },
    /**
    *List.remove(n)
    *   n番目の要素を削除します
    *@param {int} n
    */
    remove: function(n){
        // List.get(n)で対象要素を取得
        var node = this.get(n);

        // ノードのつなぎを変更
        // 1. "対象要素の前の要素"の次参照を対象要素の次の要素に変更
        // 2. "対象要素の次の要素"の前参照を対象要素の前の要のに変更
        node.prev.next = node.next;
        node.next.prev = node.prev;

        // 長さを減らす
        this.length--;
    },
    /**
    *List.nextData()
    *   カレントノードを次のノードに進め、値を返します
    *@return {Object} data
    */
    nextData: function(){
        this.curNode = this.curNode.next;
        return this.curNode.data;
    },
    /**
    *List.prevData()
    *   カレントノードを前のノードに戻り、値を返します
    *@return {Object} data
    */
    prevData: function(){
        this.curNode = this.curNode.prev;
        return this.curNode.data;
    },
    
    /**
	 * Check where in the list an element is, -1 is not found
	 */
	this.indexOf = function(data) {
		var currentNode = this.firstNode;
		var position = 0;
		var found = false;
	        
        for (; ; position++) {
            if (currentNode == null) {
                break;
            }
            
            if (data == currentNode.data) {
            	found = true;
                break;
            }
                
            currentNode = currentNode.next;
        }
        
        if (!found) {
        	position = -1;
        }
        
        return position;
	}
}

/**
* List の要素
* @param {Object} data
* @param {Node}   prev
* @param {Node}   next
*/
var Node = function(data, prev, next){
    this.data = data || null;
    this.prev = prev || null;
    this.next = next || null;
}