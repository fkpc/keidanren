import { extendGraphics } from "https://js.sabae.cc/extendGraphics.js";
import { hsl2rgb } from "https://js.sabae.cc/hsl2rgb.js";
import { Num } from "https://js.sabae.cc/Num.js";

const create = (tag) => document.createElement(tag);
const clear = (ele) => ele.innerHTML = "";

export const showQuestionnaire = data => {
	const showGraph = () => {
		let i = 0;
		for (const d of data) {
			const btn = create("option");
			btn.textContent = d.question;
			btns.appendChild(btn);
		}
		btns.onchange = () => sel(btns.selectedIndex);
		sel(0);
	};
	const sel = (idx) => {
		const d = data[idx];
		const gdata = { data: {}, unit: "%" };
		const maxans = 30;
		const obj = {};
		for (let i = 1; i <= maxans; i++) {
			const name = "answer" + i;
			const val = "answer" + i + "n";
			if (!d[name]) {
				break;
			}
			gdata.data[d[name]] = d[val];
		}
		showCircleGraph(canvas, gdata);
		clear(tbl);
		showTable(tbl, gdata);
	};
	showGraph();
};


const showTable = function(div, gdata) {
	console.log(gdata);
	const data = gdata.data;
	const unit = gdata.unit;
	const d = [];
	let sum = 0;
	for (const n in data) {
		d.push([n, data[n]]);
		sum += parseFloat(data[n]);
	}
	d.sort((a, b) => {
		if (a[1] < b[1])
			return 1;
		if (a[1] == b[1])
			return 0;
		return -1;
	});
	d.push(["合計", sum]);
	const tbl = create("table");
	for (let i = 0; i < d.length; i++) {
		const tr = create("tr");
		let td = create("td");
		const s = d[i][0];
		if (s.startsWith("http://") || s.startsWith("https://")) {
			td.innerHTML = "<a href=" + s + " target=_blank>" + s + "</a>";
		} else {
			td.textContent = s;
		}
		tr.appendChild(td);
		td = create("td");
		//td.textContent = Num.addComma(d[i][1]) + unit;
		td.textContent = parseFloat(d[i][1]).toFixed(1) + unit;
		tr.appendChild(td);
		if (unit != "%") {
			td = create("td");
			td.textContent = (d[i][1] / sum * 100).toFixed(1) + "%";
			tr.appendChild(td);
		}
		tbl.appendChild(tr);
	}
	div.appendChild(tbl);
};
const showCircleGraph = function(c, gdata) {
	const data = gdata.data;
	const unit = gdata.unit;
	const g = c.getContext("2d");
	extendGraphics(g);
	g.canvas1 = c;
	g.init = () => {
		const ua = navigator.userAgent;
		//this.ratio = 1;
		//if (ua.indexOf("iPhone") >= 0 || ua.indexOf("iPad") >= 0 || ua.indexOf("iPod") >= 0)
		g.ratio = window.devicePixelRatio;
		g.cw = g.canvas1.clientWidth * g.ratio;
		g.ch = g.canvas1.clientHeight * g.ratio;
		g.canvas1.width = g.cw;
		g.canvas1.height = g.ch;
		g.canvas1.ratio = g.ratio;
		if (g.draw != null) {
			g.draw();
		}
	};
	g.init();
	const d = [];
	let sum = 0;
	for (const n in data) {
		d.push([n, data[n]]);
		sum += parseFloat(data[n]);
	}
	console.log(sum);
	
	d.sort(function(a, b) {
		if (a[0] == "その他")
			return 1;
		if (b[0] == "その他")
			return -1;
		if (a[1] < b[1])
			return 1;
		if (a[1] == b[1])
			return 0;
		return -1;
	});
//	dump(d);
	g.setFont = (sh) => {
		g.font = "normal " + sh + "px sans-serif";
	};
	g.fillTextCenter = (s, x, y) => {
		const met = g.measureText(s);
		const sw = met.width;
		g.fillText(s, x - sw / 2, y);
	};
	let timer = null;
	
	const animation = (t, type) => {
		switch (type) {
			case 0:
				return t * t;
			case 1:
				return 1 - (1 - t) * (1 - t);
		}
		return t;
	};
	
	let t = 0;
	g.draw = () => {
		g.setColor(255, 255, 255);
		g.fillRect(0, 0, g.cw, g.ch);
		
		const cx = g.cw / 2;
		const cy = g.ch / 2;
		const r = Math.min(g.cw, g.ch) / 2 * .95;
		
		const max = Math.PI * 2 * animation(t / 100, 1);
		const f = function(dx, dy, s, v) {
			g.translate(dx, dy);
			let th = -Math.PI / 2;
			for (let i = 0; i < d.length; i++) {
				const dth = d[i][1] / sum * max;
				const col = hsl2rgb(90 + 320 / d.length * i, s, v);
				g.beginPath();
				g.setColor(col[0], col[1], col[2]);
				g.moveTo(cx, cy);
				g.arc(cx, cy, r, th, th + dth, false);
				g.lineTo(cx, cy);
				g.closePath();
				g.fill();
				th += dth;
			}
			g.translate(-dx, -dy);
		};
		f(8, 8, .4, .8);
		//f(0, 0, .4, 1);

		const fh = g.ch / 30;
		g.setFont(fh);
//		g.setColor(255, 255, 255);
		g.setColor(0, 0, 0);
		let th = -Math.PI / 2;
		for (let i = 0; i < d.length; i++) {
			const dth = d[i][1] / sum * max;
			const x = cx + Math.cos(th + dth / 2) * r * .7;
			const y = cy + Math.sin(th + dth / 2) * r * .7;
			g.fillTextCenter(d[i][0], x, y - fh / 6);
			g.fillTextCenter(Num.addComma(d[i][1]) + unit, x, y + fh + fh / 6);
			g.fillTextCenter((d[i][1] / sum * 100).toFixed(1) + "%", x, y + fh * 2 + fh / 6);
			th += dth;
		}
		g.fillTextCenter("総数", cx, cy - fh / 6);
		g.fillTextCenter(Num.addComma(sum) + unit, cx, cy + fh + fh / 6);
		if (t >= 100) {
			clearInterval(timer);
		}
	};
	g.init();
	if (timer) {
		clearInterval(timer);
	}
	timer = setInterval(() => {
		g.draw();
		t++;
	}, 10);
};
