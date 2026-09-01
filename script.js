(function () {
  'use strict';

  var THEMES = {
    sunset: { c1: '#F59E0B', c2: '#8B5CF6', text: '#FFFFFF', accent: '#FFFFFF' },
    ocean: { c1: '#0A2A4A', c2: '#19B8D4', text: '#FFFFFF', accent: '#8FF3FF' },
    mono: { c1: '#0A101E', c2: '#1B2540', text: '#EAF0FA', accent: '#19B8D4' },
    neon: { c1: '#EC4899', c2: '#7C3AED', text: '#FFFFFF', accent: '#FDE68A' },
  };

  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  var W = canvas.width, H = canvas.height;

  var titleInput = document.getElementById('titleInput');
  var subtitleInput = document.getElementById('subtitleInput');
  var tagInput = document.getElementById('tagInput');
  var themeSelect = document.getElementById('themeSelect');
  var layoutSelect = document.getElementById('layoutSelect');

  function wrapText(text, font, maxWidth) {
    ctx.font = font;
    var lines = [];
    var line = '';
    for (var i = 0; i < text.length; i++) {
      var test = line + text[i];
      if (ctx.measureText(test).width > maxWidth && line) {
        lines.push(line);
        line = text[i];
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  }

  function drawBackground(theme, layout) {
    var grad;
    if (layout === 'split') {
      grad = ctx.createLinearGradient(0, 0, W, H);
    } else {
      grad = ctx.createLinearGradient(0, 0, 0, H);
    }
    grad.addColorStop(0, theme.c1);
    grad.addColorStop(1, theme.c2);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // decorative translucent circles for texture
    ctx.save();
    ctx.globalAlpha = 0.14;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(W * 0.85, H * 0.12, 180, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W * 0.1, H * 0.88, 140, 0, Math.PI * 2); ctx.fill();
    ctx.restore();

    if (layout === 'split') {
      ctx.save();
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(0, H * 0.55);
      ctx.lineTo(W, H * 0.32);
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
  }

  function drawTag(text, x, y, theme, align) {
    ctx.font = '600 26px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    var padX = 22, padY = 14;
    var w = ctx.measureText(text).width + padX * 2;
    var h = 26 + padY * 2;
    var boxX = align === 'center' ? x - w / 2 : x;
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.16)';
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    roundRect(boxX, y, w, h, h / 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = theme.text;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, boxX + padX, y + h / 2 + 1);
    ctx.restore();
    return h;
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function render() {
    var theme = THEMES[themeSelect.value];
    var layout = layoutSelect.value;
    var title = titleInput.value || '标题';
    var subtitle = subtitleInput.value || '';
    var tag = tagInput.value || '';

    ctx.clearRect(0, 0, W, H);
    drawBackground(theme, layout);

    var titleFont = 'bold 64px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    var subFont = '400 26px -apple-system,"PingFang SC","Microsoft YaHei",sans-serif';
    var maxTextWidth = W * 0.78;
    var titleLines = wrapText(title, titleFont, maxTextWidth);

    var cx = W / 2;
    var blockHeight = titleLines.length * 76 + (subtitle ? 50 : 0) + (tag ? 70 : 0);
    var startY;
    var textAlign;

    if (layout === 'center') {
      startY = H / 2 - blockHeight / 2;
      textAlign = 'center';
    } else if (layout === 'bottom') {
      startY = H - blockHeight - 90;
      textAlign = 'center';
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(0, startY - 50, W, H - (startY - 50));
      ctx.restore();
    } else {
      startY = H * 0.32;
      textAlign = 'left';
      cx = 70;
    }

    ctx.textAlign = textAlign;
    ctx.textBaseline = 'alphabetic';

    var y = startY;
    if (tag) {
      var tagW = ctx.measureText(tag).width;
      var tagH = drawTag(tag, textAlign === 'center' ? cx : cx, y, theme, textAlign);
      y += tagH + 26;
    }

    ctx.font = titleFont;
    ctx.fillStyle = theme.text;
    titleLines.forEach(function (line) {
      ctx.fillText(line, cx, y + 50);
      y += 76;
    });

    if (subtitle) {
      ctx.font = subFont;
      ctx.fillStyle = theme.text;
      ctx.globalAlpha = 0.82;
      var subLines = wrapText(subtitle, subFont, maxTextWidth);
      subLines.forEach(function (line) {
        ctx.fillText(line, cx, y + 20);
        y += 38;
      });
      ctx.globalAlpha = 1;
    }
  }

  [titleInput, subtitleInput, tagInput].forEach(function (el) {
    el.addEventListener('input', render);
  });
  [themeSelect, layoutSelect].forEach(function (el) {
    el.addEventListener('change', render);
  });

  document.getElementById('btnExport').addEventListener('click', function () {
    canvas.toBlob(function (blob) {
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'poster.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    });
  });

  render();
})();
