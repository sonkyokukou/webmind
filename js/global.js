//origin 原点； padding 工作区内边界； rootX，rootY 根节点坐标； bentLen 拐角长度（好像没有使用）； 
//textLeftMargin 文本左外边界； nodeHeight 节点高度; spacing 最终叶子之间的间隔； levelList 兄弟节点数组的数组；
var Gol = {"origin": {}, "padding": 5,'rootX': 100,'rootY': 400,'bentLen': 20,'textLeftMargin':5,'nodeHeight': 10,'leafSpacing':20,'levelList':[],'posToLastNode':0};

//Gol.data = {"id":'node1',"leftLeafNum":3,"rightLeafNum":2,"level":1,"title":'root',"x0":200,"y0":400,"len":25,"children":[
//	           {"id":'node2',"leafNum":0,"level":2,"title":'test1',"x0":180,"y0":380,"len":30,"children":[]}
//	           ,{"id":'node3',"leafNum":0,"level":2,"title":'test2',"x0":235,"y0":420,"len":30,"children":[
//	           		{"id":'node10',"leafNum":0,"level":3,"title":'test21',"x0":1510,"y0":420,"len":35,"children":[]}
//	           	]}
//	           ,{"id":'node4',"leafNum":1,"level":2,"title":'test3',"x0":235,"y0":380,"len":30,"children":[
//					{"id":'node9',"leafNum":0,"level":3,"title":'test31',"x0":275,"y0":370,"len":35,"children":[]}
//					,{"id":'node11',"leafNum":0,"level":3,"title":'test32',"x0":275,"y0":390,"len":35,"children":[]}
//	            ]}
//	           ,{"id":'node5',"leafNum":2,"level":2,"title":'test4',"x0":180,"y0":430,"len":30,"children":[
//					{"id":'node6',"leafNum":0,"level":3,"title":'test41',"x0":140,"y0":410,"len":35,"children":[]}
//					,{"id":'node7',"leafNum":0,"level":3,"title":'rest42',"x0":140,"y0":430,"len":35,"children":[]}
//					,{"id":'node8',"leafNum":0,"level":3,"title":'test43',"x0":140,"y0":450,"len":35,"children":[
//						{"id":'node12',"leafNum":0,"level":4,"title":'test431',"x0":0,"y0":450,"len":40,"children":[]}
//					]}
//	        	]}
//	       ]};
Gol.data = {"id":'root',"leftLeafNum":1,"rightLeafNum":1,"leftFirstNode":'node2',"rightFirstNode":'node4',"leftLastNode":'node5',"rightLastNode":'node3',"level":1,"title":'root',"x0":200,"y0":400,"len":25,"children":[
	           {"id":'node2',"leafNum":0,"firstNode":'',"lastNode":'',"level":2,"title":'test1',"x0":-20,"y0":-20,"len":30,"children":[]}
	           ,{"id":'node3',"leafNum":0,"firstNode":'node10',"lastNode":'node10',"level":2,"title":'test2',"x0":35,"y0":15,"len":30,"children":[
	           		{"id":'node10',"leafNum":0,"firstNode":'',"lastNode":'',"level":3,"title":'test21',"x0":1300,"y0":0,"len":35,"children":[]}
	           	]}
	           ,{"id":'node4',"leafNum":1,"firstNode":'node9',"lastNode":'node11',"level":2,"title":'test3',"x0":35,"y0":-15,"len":30,"children":[
					{"id":'node9',"leafNum":0,"firstNode":'',"lastNode":'',"level":3,"title":'test31',"x0":40,"y0":-10,"len":35,"children":[]}
					,{"id":'node11',"leafNum":0,"firstNode":'',"lastNode":'',"level":3,"title":'test32',"x0":40,"y0":10,"len":35,"children":[]}
	            ]}
	           ,{"id":'node5',"leafNum":2,"firstNode":'node6',"lastNode":'node8',"level":2,"title":'test4',"x0":-20,"y0":20,"len":30,"children":[
					{"id":'node6',"leafNum":0,"firstNode":'',"lastNode":'',"level":3,"title":'test41',"x0":-40,"y0":-20,"len":35,"children":[]}
					,{"id":'node7',"leafNum":0,"firstNode":'',"lastNode":'',"level":3,"title":'rest42',"x0":-40,"y0":0,"len":35,"children":[]}
					,{"id":'node8',"leafNum":0,"firstNode":'node12',"lastNode":'node12',"level":3,"title":'test43',"x0":-40,"y0":20,"len":35,"children":[
						{"id":'node12',"leafNum":0,"firstNode":'',"lastNode":'',"level":4,"title":'test431',"x0":-140,"y0":0,"len":40,"children":[]}
					]}
	        	]}
	       ]};
//数字与小写字母组成的10位字符串
Gol.getNewId = function(){
	return 'node'+Math.floor(Math.random() * 0xFFFFFFFFFF).toString(16);
}

Gol.openDialog = function(id){
	$('#'+id).show();
	$('#'+id).focus();
};

Gol.closeDialog = function(id){
	$('#'+id).hide();
};

Gol.zoom = function(selectinon,trs,sca) {
	trs = trs || d3.event.translate;
	sca = sca || d3.event.scale;
	Gol.origin.x = trs[0];
	Gol.origin.y = trs[1];
	Gol.scaleRate = sca;
	Gol.workspace.attr("transform", "translate(" + trs + ")scale(" + sca + ")");
};

Gol.nodeHighlight = function(d,i){
	//高亮现在的节点
	Gol.curNode.select('rect').classed('nodeHighlight',false);
	d3.select('#'+d.id).select('rect').classed('nodeHighlight',true);
	Gol.curNode = d3.select('#'+d.id);
};

Gol.line = d3.svg.line()
.x(function(d) { return d.x; })
.y(function(d) { return d.y; })
.interpolate("basis");

Gol.render = function(nodes){
	Gol.nodes = nodes;
	var node = Gol.workspace.selectAll("g.node")
	.data(nodes).enter().append("g")
	.attr({"id": function(d,i){return d.id;}
			,"class": "node"
			,'setX1Y1': function(d,i){
				//计算绝对坐标,放在这里只是为了能够计算最新的，
				if(d.level==1){
					d.x1=d.x0;
					d.y1=d.y0;
				}else{
					d.x1=d.parent.x1+d.x0;
					d.y1=d.parent.y1+d.y0;
				}
			}
			,'setLevelNodeList': function(d,i){
				//各级兄弟节点的数组
				if(Gol.levelList[d.depth]===undefined) Gol.levelList[d.depth]={'left':[],'right':[]};
				if(d.x0<0){
					Gol.levelList[d.depth].left.push(d);
				}else{
					Gol.levelList[d.depth].right.push(d);
				}
			}
		});
	
	node.append('rect')
	.attr({"width": function(d,i){return d.len-5;}
		,"height": Gol.nodeHeight
		,"x": function(d,i) {
			if(d.level!=1 && d.x0<0){
				return d.x1-d.len+Gol.textLeftMargin;
			}
            return d.x1;
        }
		,"y": function(d,i) {
            return d.y1-Gol.nodeHeight;
        }
	});

	node.append('text')
	.attr({"x": function(d,i) {
				//该属性记录节点在左、右的位置
				d.right = 1;
				//左边的节点
				if(d.level!=1 && d.x0<0){
					d.right = 0;
					return d.x1-d.len+Gol.textLeftMargin;
				}
		        return d.x1;
		     }
			,"y": function(d,i) {
		            return d.y1;
		        }
		})
	.text(function(d){
		return d.title;
	})
	.on('click',function(d,i){
		//高亮现在的节点
		Gol.nodeHighlight(d,i);
	});

	Gol.workspace.selectAll("path.link")
    .data(Gol.links)
    .enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
    	var lgh = d.target.x0<0 ? -1 : 1;
    	if(d.source.depth===0 && lgh<0){
    		var sourceLen = -10;
    	}else{
    		var sourceLen = lgh*d.source.len;
    	}
    	var da = [{"x":d.source.x1+sourceLen,"y":d.source.y1},{"x":d.source.x1+sourceLen,"y":d.target.y1},{"x":d.target.x1,"y":d.target.y1}
    			 ,{"x":d.target.x1+lgh*d.target.len,"y":d.target.y1}];
    	return Gol.line(da);
    })
    .attr("stroke", "blue")
        .attr("stroke-width", 2);
//        .attr("fill", "none")
    
//		link.transition()
//		.duration(7500)
//	    .attr("d", line);
//console.log(quickSort(nodes,'y1'));
};

Gol.updateNode = function(nodes){
	Gol.nodes = nodes;
	var node = Gol.workspace.selectAll("g.node").data(nodes);
	
	node.select('rect')
	.attr({"width": function(d,i){return d.len-5;}
		,"height": Gol.nodeHeight
		,'setX1Y1': function(d,i){
			//计算绝对坐标,放在这里只是为了减少一次全循环，
			if(d.level==1){
				d.x1=d.x0;
				d.y1=d.y0;
			}else{
				d.x1=d.parent.x1+d.x0;
				d.y1=d.parent.y1+d.y0;
			}
		}
		,"x": function(d,i) {
			if(d.level!=1 && d.x0<0){
				return d.x1-d.len+Gol.textLeftMargin;
			}
            return d.x1;
        }
		,"y": function(d,i) {
            return d.y1-Gol.nodeHeight;
        }
	});

	node.select('text')
	.attr({"x": function(d,i) {
				//该属性记录节点在左、右的位置
				d.right = 1;
				//左边的节点
				if(d.level!=1 && d.x0<0){
					d.right = 0;
					return d.x1-d.len+Gol.textLeftMargin;
				}
		        return d.x1;
		     }
			,"y": function(d,i) {
		            return d.y1;
		        }
		})
	.text(function(d){
		return d.title;
	})
	.on('click',function(d,i){
		//高亮现在的节点
		Gol.curNode.select('rect').classed('nodeHighlight',false);
		d3.select('#'+d.id).select('rect').classed('nodeHighlight',true);
		Gol.curNode = d3.select('#'+d.id);
	});

	Gol.workspace.selectAll("path.link")
    .data(Gol.links)
    .attr("class", "link")
    .attr("d", function(d) {
    	var lgh = d.target.x0<0 ? -1 : 1;
    	if(d.source.depth===0 && lgh<0){
    		var sourceLen = -10;
    	}else{
    		var sourceLen = lgh*d.source.len;
    	}
    	var da = [{"x":d.source.x1+sourceLen,"y":d.source.y1},{"x":d.source.x1+sourceLen,"y":d.target.y1},{"x":d.target.x1,"y":d.target.y1}
    			 ,{"x":d.target.x1+lgh*d.target.len,"y":d.target.y1}];
    	return Gol.line(da);
    })
    .attr("stroke", "blue")
        .attr("stroke-width", 2);
//        .attr("fill", "none")
}

Gol.removeNode = function(nodes){
	Gol.workspace.selectAll("g.node").data(nodes, function(d) { return d.id; }).exit().remove();
	Gol.workspace.selectAll("path.link").data(Gol.links, function(d) { return d.target.id; }).exit().remove();
};

//in_array
//prop 数组的元素如果是对象，这个表示作为比较基准的对象属性
String.prototype.in_array = function(ary,prop) {
	if(prop===undefined){
		for(var i = 0, l = ary.length; i < l; i++) {
			if(ary[i] == this) {
				return i;
			}
		}
	}else{
		prop = prop.replace(/\./g,"']['",prop);
		for(var i = 0, l = ary.length; i < l; i++) {
			if(eval('ary[i][\''+prop+'\']') == this) {
				return i;
			}
		}
	}
	return false;
};
//删除数组第n项，并改变数字长度
Array.prototype.del=function(n) {
		if(n<0)  //如果n<0，则不进行任何操作。
			return this;
		else
			return this.slice(0,n).concat(this.slice(n+1,this.length));
};
//prop 数组的元素如果是对象，这个表示作为比较基准的对象属性
Array.prototype.delByValue=function(val,prop) {
	if(typeof(val)!='string')return false;
	var key = val.in_array(this,prop);
	if(key!==false){
		return this.del(key);
	}else{
		return this;
	}
};
//数组的和
Array.prototype.union=function(ary){
	for(var i = 0, l = ary.length; i < l; i++){
		if(!ary[i].in_array(this)){
			this.push(ary[i]);
		}
	}
	return this;
};
//数组的差
Array.prototype.difference=function(ary){
	var tmp = this;
	for(var i = 0, l = ary.length; i < l; i++){
		var j = ary[i].in_array(tmp);
		if(j!==false){
			tmp=tmp.del(j);
		}
	}
	return tmp;
};
Array.prototype.swap = function(a, b) {
	var tmp = this[a];
	this[a] = this[b];
	this[b] = tmp;
	return this;
};
function array_flip (trans) {
	  // http://kevin.vanzonneveld.net
	  // +   original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  // +      improved by: Pier Paolo Ramon (http://www.mastersoup.com/)
	  // +      improved by: Brett Zamir (http://brett-zamir.me)
	  // *     example 1: array_flip( {a: 1, b: 1, c: 2} );
	  // *     returns 1: {1: 'b', 2: 'c'}
	  // *     example 2: ini_set('phpjs.return_phpjs_arrays', 'on');
	  // *     example 2: array_flip(array({a: 0}, {b: 1}, {c: 2}))[1];
	  // *     returns 2: 'b'

	  var key, tmp_ar = {};

	  if (trans && typeof trans=== 'object' && trans.change_key_case) { // Duck-type check for our own array()-created PHPJS_Array
	    return trans.flip();
	  }

	  for (key in trans) {
	    if (!trans.hasOwnProperty(key)) {continue;}
	    tmp_ar[trans[key]] = key;
	  }

	  return tmp_ar;
	};
function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; ++i) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
};

//快速排序--降序
//http://110chang.com/knowledge/javascript-sort-argorythm/
//从这里可以看到快速排序基本在各个浏览器上都是最快的
//如果数组元素是对象的话，使用prop参数来表示需要比较的对象属性
//TODO 左右两个数组是不是可以并行处理呢，http://www.hcn.zaq.ne.jp/___/WEB/Workers-ja.html
//http://www.html5rocks.com/zh/tutorials/workers/basics/
var quickSort = function(arr,prop) {
	if (arr.length <= 1) { return arr; }
	var pivotIndex = Math.floor(arr.length / 2);
	var pivotv = pivot = arr.splice(pivotIndex, 1)[0];
	//对象
	if(prop!==undefined) pivotv = pivot[prop];
	var left = [];
	var right = [];
	var mid = [pivot];
	for (var i = 0; i < arr.length; i++){
		var cur = arr[i];
		if(prop!==undefined) cur = cur[prop];
		if (cur > pivotv) {
			left.push(arr[i]);
		} else {
			right.push(arr[i]);
		}
	}
	if(prop!==undefined) var res = quickSort(left,prop).concat(quickSort(mid), quickSort(right,prop));
	else var res = quickSort(left).concat(quickSort(mid), quickSort(right));
	return res;
};

