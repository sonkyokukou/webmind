(function(){
	
	var toChildren = function(){
		//进入子节点
		var crn = Gol.curNode.data()[0].children;
		if(crn===undefined || crn.length==0)return false;
		Gol.nodeHighlight(crn[0]);
	};
	var toParent = function(){
		//回到父节点
		var prt = Gol.curNode.data()[0].parent;
		if(prt===undefined)return false;
		Gol.nodeHighlight(prt);
	};
	var toRootChildren = function(key){
	    var crn;
	    if(key=='left'){
	        if(Gol.levelList[1].left.length>0)
	            crn = Gol.levelList[1].left[0];
	        else return false;
	    }else{
	        if(Gol.levelList[1].right.length>0)
	            crn = Gol.levelList[1].right[0];
	        else return false;
	    }
	    Gol.nodeHighlight(crn);
	};

	var changeNodeText = function(that){
		that.data('obj').select('text').text(that.val());
		//写入JSON对象中
		getJsonObject(that.data('obj').data()[0]).title = that.val();
		closeTextDialog();
		$.Shortcuts.stop();
		//开始主界面菜单
		$.Shortcuts.start('main');
	};
	
	var closeTextDialog = function(){
		Gol.closeDialog('textDialog');
		$('#nodeText').val('');
	};
	
	var plusLeafNum = function(node){
		chgLeafNum(node,1);
	};
	
	var minusLeafNum = function(node){
		chgLeafNum(node,-(node.leafNum));
	};
	
	var chgLeafNum = function(node,num){
		//变更节点属性
		var prt = node.parent;
		do{
			if(prt.leafNum!==undefined){
				prt.leafNum+=num;
			}else{
				if(node.x0 > prt.x0){
					prt.rightLeafNum+=num;
				}else{
					prt.leftLeafNum+=num;
				}
			}
			prt = d3.select('#'+prt.id).data()[0].parent;
		}while(prt!==undefined);
		//变更JSON对象属性
		var tmp = getJsonParentKey(node);
		var data = Gol.data;
		if(node.x0 > data.x0){
			data.rightLeafNum+=num;
		}else{
			data.leftLeafNum+=num;
		}
		while((ele=tmp.pop())!==undefined){
			data = data.children[ele];
			data.leafNum+=num;
		}
	}
	//取得当前节点子孙中最后节点（位置最下的节点），
	//如果有孩子的话，取得孩子的最后节点
	//并且计算最后节点到当前节点的相对位置
	var getLastNode = function(node){
		var ln = node.lastNode;
		if(ln=='')return false;
		var n = d3.select('#'+ln).data()[0]
		Gol.posToLastNode += n.y0;
		if(n.leafNum>0){
			n = getLastNode(n);
		}
		return n;
	}
	
	var addNode = function(node){
		var y0 = getLastNode(node) ? Gol.posToLastNode+node.y0 : node.y0;
		Gol.posToLastNode = 0;
		var obj = {
				'id':Gol.getNewId()
				,'level':node.level
				,'depth':node.depth
				,'title':'New Node'
				,'leafNum':0
				,'lastNode':''
				,'x0':node.x0
				,'y0':y0+Gol.leafSpacing
//				,'y0':node.y0+Gol.leafSpacing*(node.leafNum+2)/2
				,'len':80
				,'parent':node.parent
				,'x':0.5
				,'y':0.3
				};
		//添加到json对象中
		addToJsonObject(obj);
		//添加到父节点
		node.parent.children.push(obj);
		//添加元素
		Gol.nodes.push(obj);
		//添加连线
		Gol.links.push({'source':obj.parent,'target':obj});
		//添加DOM元素
		Gol.render(Gol.nodes);
		//添加到链表
		var nodeEle = d3.select('#'+node.id),objEle = d3.select('#'+obj.id),
			next = nodeEle.property('LevelLinkedList').next;
		nodeEle.property('LevelLinkedList').next = objEle;
		objEle.property('LevelLinkedList',{"prev":nodeEle,"data":obj.id,"next":next});
		next.property('LevelLinkedList').prev = objEle;
		//DOM中最下边子节点的检查
		chgLastNode(node,obj.id);
	};
	var chgLastNode = function(node,id){
		var last = node.level!=2 ? 'lastNode' : node.right ? 'rightLastNode' : 'leftLastNode';
		if(node.parent.children.length==1){
			node.parent[last] = '';
		}else{
			if(node.parent[last]==node.id){
				node.parent[last] = id;
			}
		}
	};
	var chgFirstNode = function(node,id){
		var fir = node.level!=2 ? 'firstNode' : node.right ? 'rightFirstNode' : 'leftFirstNode';
		if(node.parent.children.length==1){
			node.parent[fir] = '';
		}else{
			if(node.parent[fir]==node.id){
				node.parent[fir] = id;
			}
		}
	}
	//添加到json对象中
	var addToJsonObject = function(node){
		var obj2 = {
				'id':node.id
				,'level':node.level
				,'title':node.title
				,'leafNum':0
				,'lastNode':''
				,'x0':node.x0
				,'y0':node.y0
				,'len':node.len
				,'children':[]
		};
		getJsonObjectParent(node.parent).children.push(obj2);
	};
	
	var delNode = function(node){
		//从json对象中删除
		var prt =getJsonObjectParent(node.parent); 
		prt.children = prt.children.delByValue(node.id,'id');
		//删除链表元素
		if((nodeEle = d3.select('#'+node.id).property('LevelLinkedList'))!==undefined){
			var next = nodeEle.next,
				prev = nodeEle.prev;
			prev.property('LevelLinkedList').next = next;
			next.property('LevelLinkedList').prev = prev;
			//把前边的节点作为当前节点
			Gol.nodeHighlight(prev.data()[0]);
		}
		//DOM中最上边子节点的检查
		chgFirstNode(node,next.property('id'));
		//DOM中最下边子节点的检查
		chgLastNode(node,prev.property('id'));
		//从父节点的孩子列表中删除
		node.parent.children = node.parent.children.delByValue(node.id,'id');
		//从节点数组和连线数组中删除
		delChd(node);
		//删除DOM元素
		Gol.removeNode(Gol.nodes);
	};
	
	var delChd = function(node){
		if(node.children!==undefined){
			$.each(node.children,function(i,n){
				delChd(n);
			});
		}
		//删除node元素
		Gol.nodes = Gol.nodes.delByValue(node.id,'id');
		//删除连线
		Gol.links = Gol.links.delByValue(node.id,'target.id');
	};
	
	//json中各级父节点的位置
	var getJsonParentKey = function(node){
		var prt = node, pt = node.parent;
		var tmp=[];
		while(pt!==undefined){
			tmp.push(prt.id.in_array(pt.children,'id'));
			prt = pt;
			pt = d3.select('#'+prt.id).data()[0].parent;
		}
		return tmp;
	};
	//json中当前节点的父节点对应的对象
	//node  当前节点的父节点
	var getJsonObjectParent = function(node){
		var tmp = getJsonParentKey(node);
		var data = Gol.data;
		while((ele=tmp.pop())!==undefined){
			data = data.children[ele];
		}
		return data;
	};
	//json中当前节点对应的对象
	var getJsonObject = function(node){
		return getJsonObjectParent(node.parent).children[node.id.in_array(node.parent.children,'id')];
	}
	
	
	//假设父节点不动，当前节点和上方兄弟节点上移一个单位，下方节点下移一个单位，
	//以此类推，一直到根节点，只是移动单位会递减
	//单位，随着距离当前节点层数的增加，以2的指数分之一递减
	//ord   父节点序列
	var coordinatesPrt;
	var downCoordinates = function(node,ord,flg){
		//lev   父节点的深度
		var data = Gol.data,k,lev=ord.length;
		while((k=ord[lev-1])!==undefined){
			var chd = d3.select('#'+data.id).data()[0].children;
			cur = chd[k];
			//变更对象纵坐标
			chd.forEach(function(o,i){
				if(o.right!=node.right){
					return true;
				}
				//cur节点总上移一个单位,在当前节点cur下方兄弟节点下移一个单位，
				//上方与node同级的节点上移一个单位，上方与node不同级的节点上移3个单位（cur子节点上移了Gol.leafSpacing/Math.pow(2,lev-1)，
				//cur上移了Gol.leafSpacing/Math.pow(2,lev)，总效应是3*Gol.leafSpacing/Math.pow(2,lev)）
				//以此类推，各级效应会累加，最终结果是(Math.pow(2,lev)-1)*Gol.leafSpacing/Math.pow(2,lev)
				var sign = '';
				if(o.level==node.level){
					sign = o.y0<=cur.y0 ? -1 : 1;
				}else{
					var chdy0 = lev>2 ? node.parent.y0 : cur.y0,
							y0 = chdy0*cur.y0<=0 ? chdy0 : cur.y0;
					if(y0<0){
						sign = o.y0<cur.y0 ? (1-Math.pow(2,lev)) : (o.y0==cur.y0 ? -1 : 1);
					}else{
						sign = o.y0<cur.y0 ? -1 : (o.y0==cur.y0 ? 1 : (Math.pow(2,lev)-1));
					}
				}
//					sign = flg=='down'?sign:-sign;
//					var leafNum = flg=='down'?1:(node.leafNum>0?node.leafNum/2:(node.parent.leafNum>0?1/2:0));
				o.y0 += sign*Gol.leafSpacing/Math.pow(2,lev);
				data.children[i].y0 += sign*Gol.leafSpacing/Math.pow(2,lev);
			});
			data = data.children[k];
			lev--;
		}
		coordinatesPrt = data;
	};
	
	var upCoordinates = function(node,ord,flg){
		//lev   父节点的深度
		var data = Gol.data,k,lev=ord.length;
		var firy0 = (node.firstNode==undefined ? 0 : Math.abs(d3.select('#'+node.firstNode).data()[0].y0))+Gol.leafSpacing/2;
		var lasy0 = (node.lastNode==undefined ? 0 : Math.abs(d3.select('#'+node.lastNode).data()[0].y0))+Gol.leafSpacing/2;
console.log(firy0,lasy0);
		while((k=ord[lev-1])!==undefined){
			var prt = d3.select('#'+data.id).data()[0], chd = prt.children;
			cur = chd[k],y0c = cur.y0;
			var prop1 = cur.level>1 ? 'firstNode' : cur.right ? 'rightFirstNode' : 'leftFirstNode';
			var prop2 = cur.level>1 ? 'lastNode' : cur.right ? 'rightLastNode' : 'leftLastNode';
			var firy0p = cur[prop1]==undefined ? 0 : Math.abs(d3.select('#'+cur[prop1]).data()[0].y0);
			var lasy0p = cur[prop2]==undefined ? 0 : Math.abs(d3.select('#'+cur[prop2]).data()[0].y0);
console.log(prop1,prop2,firy0p,lasy0p,(lasy0p+firy0p)/2,y0c);
			//变更对象纵坐标
			chd.forEach(function(o,i){
				if(o.right!=node.right){
					return true;
				}
				//cur节点总上移一个单位,在当前节点cur下方兄弟节点下移一个单位，
				//上方与node同级的节点上移一个单位，上方与node不同级的节点上移3个单位（cur子节点上移了Gol.leafSpacing/Math.pow(2,lev-1)，
				//cur上移了Gol.leafSpacing/Math.pow(2,lev)，总效应是3*Gol.leafSpacing/Math.pow(2,lev)）
				//以此类推，各级效应会累加，最终结果是(Math.pow(2,lev)-1)*Gol.leafSpacing/Math.pow(2,lev)
				var y0s = o.y0>cur.y0 ? -lasy0 : o.y0==cur.y0 ? 0 : firy0;
				o.y0 += y0s+((lasy0p+firy0p)/2)-firy0p;
				data.children[i].y0 += y0s+((lasy0p+firy0p)/2)-firy0p;
			});
			data = data.children[k];
			lev--;
		}
		coordinatesPrt = data;
	};
	
	//重新计算位置
	var recompleCoordinates = function(node,flg){
		var ord = getJsonParentKey(node);
		//上移，下移，平移
		if(flg=='down'){
			downCoordinates(node,ord,flg);
		}else if(flg=='up'){
			upCoordinates(node,ord,flg);
		}
	};
	
	$.Shortcuts.add({
		type: 'down',
		mask: 'up',
		handler: function() {
			console.log('up');
			var tmp = Gol.curNode.property('LevelLinkedList').prev;
			if(tmp===undefined)return false;
			tmp.select('rect').classed('nodeHighlight',true);
			Gol.curNode.select('rect').classed('nodeHighlight',false);
			Gol.curNode = tmp;
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'down',
		handler: function() {
			console.log('down');
			var tmp = Gol.curNode.property('LevelLinkedList').next;
			if(tmp===undefined)return false;
			tmp.select('rect').classed('nodeHighlight',true);
			Gol.curNode.select('rect').classed('nodeHighlight',false);
			Gol.curNode = tmp;
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'right',
		handler: function() {
			console.log('right');
			//根节点只有子节点，不过分布在两侧，所以要单独处理
			//根据节点位置的左右不同，函数也不一样
			if(Gol.curNode.data()[0].level==1){
				toRootChildren('right');
				return true;
			}
			//根节点只有子节点，不过分布在两侧，所以要单独处理
			if(Gol.curNode.data()[0].x0>0){
				toChildren();
			}else{
				toParent();
			}
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'left',
		handler: function() {
			console.log('left');
			//根据节点位置的左右不同，函数也不一样
			if(Gol.curNode.data()[0].level==1){
                toRootChildren('left');
                return true;
            }
			if(Gol.curNode.data()[0].x0>0){
				toParent();
			}else{
				toChildren();
			}
		},
		list: 'main'
	}).add({
		type: 'hold',
		mask: 'Alt+plus',
		handler: function() {
			console.log('Alt+plus');
			//扩大
			if(Gol.scaleRate <= Gol.maxScaleRate){
				Gol.scaleRate = Gol.scaleRate>Gol.maxScaleRate ? Gol.maxScaleRate : Gol.scaleRate+Gol.scaleStepping;
				var n = Gol.curNode.data()[0];
				//指定节点和原点的差（实际上就是节点的x0属性）扩大步进率的倍数，而最初的坐标原点没有变，所以被减去后，就是扩大后新原点的坐标。其实就是求扩大后坐标原点在原坐标中的位置。
				Gol.zg.call(Gol.zoom,[(Gol.origin.x-n.x0*Gol.scaleStepping),(Gol.origin.y-n.y0*Gol.scaleStepping)],Gol.scaleRate);
			}
		},
		list: 'main'
	}).add({
		type: 'hold',
		mask: 'Alt+minus',
		handler: function() {
			console.log('Alt+minus');
			//缩小
			if(Gol.scaleRate >= Gol.minScaleRate){
				Gol.scaleRate = Gol.scaleRate<Gol.minScaleRate ? Gol.minScaleRate : Gol.scaleRate-Gol.scaleStepping;
				var n = Gol.curNode.data()[0];
				Gol.zg.call(Gol.zoom,[(Gol.origin.x+n.x0*Gol.scaleStepping),(Gol.origin.y+n.y0*Gol.scaleStepping)],Gol.scaleRate);
			}
		},
		list: 'main'
	}).add({
		type: 'hold',
		mask: 'Alt+left',
		handler: function() {
			//左平移
			Gol.origin.x -= Gol.originStepping;
			Gol.zg.call(Gol.zoom,[Gol.origin.x,Gol.origin.y],Gol.scaleRate);
		},
		list: 'main'
	}).add({
		type: 'hold',
		mask: 'Alt+right',
		handler: function() {
			//右平移
			Gol.origin.x += Gol.originStepping;
			Gol.zg.call(Gol.zoom,[Gol.origin.x,Gol.origin.y],Gol.scaleRate);;
		},
		list: 'main'
	}).add({
		type: 'hold',
		mask: 'Alt+up',
		handler: function() {
			//上平移
			Gol.origin.y -= Gol.originStepping;
			Gol.zg.call(Gol.zoom,[Gol.origin.x,Gol.origin.y],Gol.scaleRate);
		},
		list: 'main'
	}).add({
		type: 'hold',
		mask: 'Alt+down',
		handler: function() {
			//下平移
			Gol.origin.y += Gol.originStepping;
			Gol.zg.call(Gol.zoom,[Gol.origin.x,Gol.origin.y],Gol.scaleRate)
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'F2',
		handler: function() {
			console.log('F2');
			//修改节点标题
			//Gol.curNode.select('text').text('texttest');
			var t = Gol.curNode.select('text').text();
			$('#nodeText').val(t);
			//$('#nodeText').css({'width':t.length*10});
			Gol.openDialog('textDialog');
			$.Shortcuts.stop();
			$.Shortcuts.start('editNodeText');
			//为了防止在修改文本过程中Gol.curNode变量被变更，使用一个obj的变量
			$('#nodeText').focus().select().data('obj',Gol.curNode);
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'enter',
		enableInInput: true,
		handler: function() {
			//添加兄弟节点
			console.log('enter');
			var node = Gol.curNode.data()[0];
			//根节点没有兄弟
			if(node.level==1)return false;
			//父节点们的叶子数+1
			plusLeafNum(node);
			//重新计算坐标并移动后面兄弟节点以及父节点们
			recompleCoordinates(node,'down');
			//在画面中更新节点的位置
			Gol.updateNode(Gol.nodes);
			//添加新节点
			addNode(node);
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'insert',
		enableInInput: true,
		handler: function() {
			//新增子节点
			console.log('insert');
			//父节点们的叶子数，+1或者+0（没有子节点或者节点数为1时）
			if(Gol.curNode.data()[0].children.length>1){
				plusLeafNum();
			}
			//重新计算后面兄弟节点以及父节点们的坐标
			recompleCoordinates(node,'down');
			//添加新节点
			addNode();
			//根据新坐标移动他们
			moveNodes();
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'delete',
		enableInInput: true,
		handler: function() {
			//删除节点包括其子节点
			console.log('delete');
			//不能删除根节点
			var node = Gol.curNode.data()[0];
			if(node.level==1)return false;
			//父节点们的叶子数
			minusLeafNum(node);
			//重新计算坐标并移动后面兄弟节点以及父节点们
			recompleCoordinates(node,'up');
			//删除新节点
			delNode(node);
			//在画面中更新节点的位置
			Gol.updateNode(Gol.nodes);
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'esc',
		enableInInput: true,
		handler: function() {
			console.log('esc');
			
		},
		list: 'main'
	}).add({
		type: 'down',
		mask: 'Ctrl+Shift+l',
		enableInInput: true,
		handler: function() {
			var w=300, h=200;
			var x = Gol.viewerWidth-3*Gol.padding-w,
				y = Gol.viewerHeight-3*Gol.padding-h;
			$('#shortcutsDialog').css({
				'width': w+'px',
				'height': h+'px',
				'top': y,
				'left': x
			});
			Gol.openDialog('shortcutsDialog');
		},
		list: 'main'
	}).start('main');
	
	$.Shortcuts.add({
		type: 'down',
		mask: 'enter',
		enableInInput: true,
		handler: function() {
			console.log('enter');
				//修改节点标题
			changeNodeText($('#nodeText'));
		},
		list: 'editNodeText'
	}).add({
		type: 'down',
		mask: 'esc',
		enableInInput: true,
		handler: function() {
			console.log('esc');
			//关闭对话框
			closeTextDialog();
			$.Shortcuts.stop();
			$.Shortcuts.start('main');
		},
		list: 'editNodeText'
	});
	
	
})();