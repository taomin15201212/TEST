(function(window, undefined) {
	var document = window.document,
		support = {
			transform3d: "WebKitCSSMatrix" in window && "m11" in new WebKitCSSMatrix,
			touch: "ontouchstart" in window
		};

	function getTranslate(x, y) {
		var distX = x,
			distY = y;
		return support.transform3d ? "translate3d(" + distX + "px, " + distY + "px, 0)" : "translate(" + distX + "px, " + distY + "px)"
	}

	function getPage(event, page) {
		return support.touch ? event.changedTouches[0][page] : event[page]
	}
	var ImgContainer = '<div class="imgzoom_pack"><div class="imgzoom_img"><img src="" /></div></div>';
	var ImagesZoom = function() {
		this.ContainerId = undefined
	};
	ImagesZoom.prototype = {
		initContainer: function() {
			if (this.ContainerId == undefined) {
				this.ContainerId = "imgzoomcontainer_" + (new Date).getTime();
				var img = document.createElement("img");
				var imgzoom = document.createElement("div");
				imgzoom.className = "imgzoom_img";
				imgzoom.appendChild(img);
				var container = document.createElement("div");
				container.id = this.ContainerId;
				container.className = "imgzoom_pack";
				container.appendChild(imgzoom);
				document.body.appendChild(container)
			}
		},
		init: function(param) {
			this.initContainer();
			var self = this,
				params = param || {};
			var imgList = document.querySelectorAll(params.elem + " img"),
				zoomMask = document.querySelector("#" + this.ContainerId),
				zoomImg = document.querySelector("#" + this.ContainerId + " .imgzoom_img img"),
				zoomClose = zoomMask;
			imgSrc = "";
			self.buffMove = 3;
			self.buffScale = 2;
			self.finger = false;
			self._destroy();
			zoomClose.addEventListener("click", function() {
				zoomMask.style.cssText = "display:none";
				zoomImg.src = "";
				zoomImg.style.cssText = "";
				self._destroy();
				document.removeEventListener("touchmove", self.eventStop, false)
			}, false);
			for (var len = imgList.length, i = 0; i < len; i++) {
				imgList[i].addEventListener("click", function() {
					imgSrc = this.getAttribute("src");
					zoomMask.style.cssText = "display:block";
					zoomImg.src = imgSrc;
					zoomImg.onload = function() {
						zoomImg.style.cssText = "margin-top:-" + zoomImg.offsetHeight / 2 + "px";
						document.addEventListener("touchmove", self.eventStop, false);
						self.imgBaseWidth = zoomImg.offsetWidth;
						self.imgBaseHeight = zoomImg.offsetHeight;
						self.addEventStart({
							wrapX: zoomMask.offsetWidth,
							wrapY: zoomMask.offsetHeight,
							mapX: zoomImg.width,
							mapY: zoomImg.height
						})
					}
				}, false)
			}
		},
		addEventStart: function(param) {
			var self = this,
				params = param || {};
			self.element = document.querySelector("#" + this.ContainerId + " img");
			self.wrapX = params.wrapX || 0;
			self.wrapY = params.wrapY || 0;
			self.mapX = params.mapX || 0;
			self.mapY = params.mapY || 0;
			self.outDistY = (self.mapY - self.wrapY) / 2;
			self.width = self.mapX - self.wrapX;
			self.height = self.mapY - self.wrapY;
			self.element.addEventListener("touchstart", function(e) {
				self._touchstart(e)
			}, false);
			self.element.addEventListener("touchmove", function(e) {
				self._touchmove(e)
			}, false);
			self.element.addEventListener("touchend", function(e) {
				self._touchend(e)
			}, false)
		},
		_destroy: function() {
			this.distX = 0;
			this.distY = 0;
			this.newX = 0;
			this.newY = 0
		},
		_changeData: function() {
			this.mapX = this.element.offsetWidth;
			this.mapY = this.element.offsetHeight;
			this.width = this.mapX - this.wrapX;
			this.height = this.mapY - this.wrapY
		},
		_touchstart: function(e) {
			var self = this;
			e.preventDefault();
			var touchTarget = e.targetTouches.length;
			self._changeData();
			if (touchTarget == 1) {
				self.basePageX = getPage(e, "pageX");
				self.basePageY = getPage(e, "pageY");
				self.finger = false
			} else {
				self.finger = true;
				self.startFingerDist = self.getTouchDist(e).dist;
				self.startFingerX = self.getTouchDist(e).x;
				self.startFingerY = self.getTouchDist(e).y
			}
		},
		_touchmove: function(e) {
			var self = this;
			e.preventDefault();
			e.stopPropagation();
			var touchTarget = e.targetTouches.length;
			if (touchTarget == 1 && !self.finger) {
				self._move(e)
			}
			if (touchTarget >= 2) {
				self._zoom(e)
			}
		},
		_touchend: function(e) {
			var self = this;
			self._changeData();
			if (self.finger) {
				self.distX = -self.imgNewX;
				self.distY = -self.imgNewY
			}
			if (self.distX > 0) {
				self.newX = 0
			} else if (self.distX <= 0 && self.distX >= -self.width) {
				self.newX = self.distX;
				self.newY = self.distY
			} else if (self.distX < -self.width) {
				self.newX = -self.width
			}
			self.reset()
		},
		_move: function(e) {
			var self = this,
				pageX = getPage(e, "pageX"),
				pageY = getPage(e, "pageY");
			self.distX = pageX - self.basePageX + self.newX;
			self.distY = pageY - self.basePageY + self.newY;
			if (self.distX > 0) {
				self.moveX = Math.round(self.distX / self.buffMove)
			} else if (self.distX <= 0 && self.distX >= -self.width) {
				self.moveX = self.distX
			} else if (self.distX < -self.width) {
				self.moveX = -self.width + Math.round((self.distX + self.width) / self.buffMove)
			}
			self.movePos();
			self.finger = false
		},
		_zoom: function(e) {
			var self = this;
			var nowFingerDist = self.getTouchDist(e).dist,
				ratio = nowFingerDist / self.startFingerDist,
				imgWidth = Math.round(self.mapX * ratio),
				imgHeight = Math.round(self.mapY * ratio);
			self.imgNewX = Math.round(self.startFingerX * ratio - self.startFingerX - self.newX * ratio);
			self.imgNewY = Math.round((self.startFingerY * ratio - self.startFingerY) / 2 - self.newY * ratio);
			if (imgWidth >= self.imgBaseWidth) {
				self.element.style.width = imgWidth + "px";
				self.refresh(-self.imgNewX, -self.imgNewY, "0s", "ease");
				self.finger = true
			} else {
				if (imgWidth < self.imgBaseWidth) {
					self.element.style.width = self.imgBaseWidth + "px"
				}
			}
			self.finger = true
		},
		movePos: function() {
			var self = this;
			if (self.height < 0) {
				if (self.element.offsetWidth == self.imgBaseWidth) {
					self.moveY = Math.round(self.distY / self.buffMove)
				} else {
					var moveTop = Math.round((self.element.offsetHeight - self.imgBaseHeight) / 2);
					self.moveY = -moveTop + Math.round((self.distY + moveTop) / self.buffMove)
				}
			} else {
				var a = Math.round((self.wrapY - self.imgBaseHeight) / 2),
					b = self.element.offsetHeight - self.wrapY + Math.round(self.wrapY - self.imgBaseHeight) / 2;
				if (self.distY >= -a) {
					self.moveY = Math.round((self.distY + a) / self.buffMove) - a
				} else if (self.distY <= -b) {
					self.moveY = Math.round((self.distY + b) / self.buffMove) - b
				} else {
					self.moveY = self.distY
				}
			}
			self.refresh(self.moveX, self.moveY, "0s", "ease")
		},
		reset: function() {
			var self = this,
				hideTime = ".2s";
			if (self.height < 0) {
				self.newY = -Math.round(self.element.offsetHeight - self.imgBaseHeight) / 2
			} else {
				var a = Math.round((self.wrapY - self.imgBaseHeight) / 2),
					b = self.element.offsetHeight - self.wrapY + Math.round(self.wrapY - self.imgBaseHeight) / 2;
				if (self.distY >= -a) {
					self.newY = -a
				} else if (self.distY <= -b) {
					self.newY = -b
				} else {
					self.newY = self.distY
				}
			}
			self.refresh(self.newX, self.newY, hideTime, "ease-in-out")
		},
		refresh: function(x, y, timer, type) {
			this.element.style.webkitTransitionProperty = "-webkit-transform";
			this.element.style.webkitTransitionDuration = timer;
			this.element.style.webkitTransitionTimingFunction = type;
			this.element.style.webkitTransform = getTranslate(x, y)
		},
		getTouchDist: function(e) {
			var x1 = 0,
				y1 = 0,
				x2 = 0,
				y2 = 0,
				x3 = 0,
				y3 = 0,
				result = {};
			x1 = e.touches[0].pageX;
			x2 = e.touches[1].pageX;
			y1 = e.touches[0].pageY - document.body.scrollTop;
			y2 = e.touches[1].pageY - document.body.scrollTop;
			if (!x1 || !x2) return;
			if (x1 <= x2) {
				x3 = (x2 - x1) / 2 + x1
			} else {
				x3 = (x1 - x2) / 2 + x2
			}
			if (y1 <= y2) {
				y3 = (y2 - y1) / 2 + y1
			} else {
				y3 = (y1 - y2) / 2 + y2
			}
			result = {
				dist: Math.round(Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))),
				x: Math.round(x3),
				y: Math.round(y3)
			};
			return result
		},
		eventStop: function(e) {
			e.preventDefault();
			e.stopPropagation()
		}
	};
	window.ImagesZoom = new ImagesZoom
})(this);