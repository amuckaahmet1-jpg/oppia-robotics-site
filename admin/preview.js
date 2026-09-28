// OPPIA ROBOTICS — yönetim paneli canlı önizlemeleri
// Düzenleme ekranının sağında, kartların sitede nasıl görüneceğini gösterir.

(function(){
  if (!window.CMS) return;
  var CMS = window.CMS;
  var h = window.h;
  var createClass = window.createClass;

  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Orbitron:wght@600;700;900&family=Inter:wght@400;500;600;700&display=swap');
  CMS.registerPreviewStyle('/admin/preview.css');

  function esc(value){
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Yeni yüklenen fotoğraflar için geçici adres, mevcutlar için sitedeki adres
  function imageUrl(props, path){
    if (!path) return '';
    try {
      var asset = props.getAsset(path);
      var url = asset && asset.toString();
      if (url && /^(blob:|data:|https?:)/.test(url)) return url;
    } catch (e) {}
    if (/^(https?:|\/)/.test(path)) return path;
    return '/' + path;
  }

  function data(props){
    var d = props.entry.getIn(['data']);
    return d && d.toJS ? d.toJS() : {};
  }

  function section(title, inner){
    return '<div class="pv"><p class="pv-kicker">Önizleme</p><h2 class="pv-title">' + esc(title) + '</h2>' + inner + '</div>';
  }

  function template(render){
    return createClass({
      render: function(){
        var html;
        try { html = render(this.props); }
        catch (e) { html = '<div class="pv"><p class="pv-empty">Önizleme oluşturulamadı.</p></div>'; }
        return h('div', { dangerouslySetInnerHTML: { __html: html } });
      }
    });
  }

  // ---------- Takım ----------
  function memberCard(props, m, featured){
    var initials = String(m.name || '').split(/\s+/).filter(Boolean).map(function(w){ return w[0]; }).slice(0, 2).join('').toUpperCase();
    var photo = m.photo
      ? '<img src="' + esc(imageUrl(props, m.photo)) + '" alt="">'
      : '<span class="pv-initials">' + esc(initials || '?') + '</span>';
    var edu = (m.education || []).map(function(e){
      return (e.department ? '<p class="pv-cyan pv-small">' + esc(e.department) + '</p>' : '') +
             (e.school ? '<p class="pv-muted pv-small">' + esc(e.school) + '</p>' : '');
    }).join('');
    return '<div class="pv-card pv-member' + (featured ? ' is-featured' : '') + '">' +
      '<div class="pv-avatar">' + photo + '</div>' +
      '<h3 class="pv-name">' + esc(m.name || 'İsimsiz üye') + '</h3>' +
      (m.role ? '<p class="pv-badge">' + esc(m.role) + '</p>' : '') + edu +
    '</div>';
  }

  var TeamPreview = template(function(props){
    var members = data(props).members || [];
    var featured = members.filter(function(m){ return m.featured; });
    var others = members.filter(function(m){ return !m.featured; });
    var inner = '';
    if (featured.length) inner += '<p class="pv-label">Üst satır</p><div class="pv-row">' + featured.map(function(m){ return memberCard(props, m, true); }).join('') + '</div>';
    inner += '<p class="pv-label">Diğer üyeler</p><div class="pv-grid pv-grid-5">' + others.map(function(m){ return memberCard(props, m, false); }).join('') + '</div>';
    if (!members.length) inner = '<p class="pv-empty">Henüz üye yok.</p>';
    return section('Takım Üyelerimiz', inner);
  });

  // ---------- Robotlar ----------
  var RobotsPreview = template(function(props){
    var robots = data(props).robots || [];
    var inner = '<div class="pv-grid pv-grid-3">' + robots.map(function(r){
      var title = r.name ? (r.code || '') + ' "' + r.name + '"' : (r.code || '');
      var feats = (r.features || []).length
        ? '<ul class="pv-list">' + r.features.map(function(f){ return '<li><span>▸</span>' + esc(f) + '</li>'; }).join('') + '</ul>'
        : '';
      return '<article class="pv-card pv-robot">' +
        '<div class="pv-robot-img">' + (r.image ? '<img src="' + esc(imageUrl(props, r.image)) + '" alt="">' : '<span>Fotoğraf yok</span>') + '</div>' +
        '<div class="pv-robot-body">' +
          '<p class="pv-amber pv-mono pv-small">' + esc(r.code) + '</p>' +
          '<h3 class="pv-name pv-name-lg">' + esc(title) + '</h3>' +
          (r.competition ? '<p class="pv-muted pv-small">' + esc(r.competition) + '</p>' : '') +
          (r.result ? '<p class="pv-cyan pv-small">' + esc(r.result) + '</p>' : '') +
          (r.description ? '<p class="pv-muted pv-text">' + esc(r.description) + '</p>' : '') +
          feats +
        '</div>' +
      '</article>';
    }).join('') + '</div>';
    return section('Robotlarımız', robots.length ? inner : '<p class="pv-empty">Henüz robot yok.</p>');
  });

  // ---------- Sayaçlar ----------
  var StatsPreview = template(function(props){
    var stats = data(props).stats || [];
    var inner = '<div class="pv-card pv-stats">' + stats.map(function(s){
      return '<div class="pv-stat"><p class="pv-stat-num">' + esc(s.value) + '</p><p class="pv-muted pv-small">' + esc(s.label) + '</p></div>';
    }).join('') + '</div>';
    return section('Rakamlarla OPPIA ROBOTICS', stats.length ? inner : '<p class="pv-empty">Henüz sayaç yok.</p>');
  });

  // ---------- Ödüller ----------
  var AwardsPreview = template(function(props){
    var awards = data(props).awards || [];
    var inner = '<div class="pv-card pv-awards">' + awards.map(function(a){
      return '<div class="pv-award"><span class="pv-trophy">🏆</span><div><p class="pv-award-title">' + esc(a.title) + '</p>' +
        (a.result ? '<p class="pv-cyan pv-small">' + esc(a.result) + '</p>' : '') + '</div></div>';
    }).join('') + '</div>';
    return section('Ödüllerimiz & Derecelerimiz', awards.length ? inner : '<p class="pv-empty">Henüz ödül yok.</p>');
  });

  // ---------- Galeri ----------
  var GalleryPreview = template(function(props){
    var slides = data(props).slides || [];
    var inner = '<div class="pv-grid pv-grid-2">' + slides.map(function(s, i){
      return '<figure class="pv-card pv-slide">' +
        (s.image ? '<img src="' + esc(imageUrl(props, s.image)) + '" alt="">' : '<div class="pv-slide-empty">Fotoğraf yok</div>') +
        '<figcaption><p class="pv-amber pv-mono pv-small">' + String(i + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0') + '</p>' +
        '<p class="pv-name">' + esc(s.title) + '</p>' +
        (s.caption ? '<p class="pv-muted pv-small">' + esc(s.caption) + '</p>' : '') + '</figcaption>' +
      '</figure>';
    }).join('') + '</div>';
    return section('Arenadan Kareler', slides.length ? inner : '<p class="pv-empty">Henüz kare yok.</p>');
  });

  // ---------- Genel bilgiler ----------
  var SitePreview = template(function(props){
    var d = data(props);
    var hero = d.hero || {}, about = d.about || {}, history = d.history || {}, contact = d.contact || {};
    var events = (history.events || []).map(function(ev){
      return '<div class="pv-event"><span class="pv-dot"></span><div><p class="pv-amber pv-mono pv-small">' + esc(ev.date) + '</p>' +
        '<p class="pv-name">' + esc(ev.title) + '</p>' + (ev.text ? '<p class="pv-muted pv-small">' + esc(ev.text) + '</p>' : '') + '</div></div>';
    }).join('');
    var socials = (contact.socials || []).map(function(s){
      return '<li><span class="pv-cyan">' + esc(s.platform) + '</span> ' + esc(s.url) + '</li>';
    }).join('');
    return '<div class="pv">' +
      '<p class="pv-kicker">Önizleme · Hero</p>' +
      '<p class="pv-hero-badge">● ' + esc(hero.badge) + '</p>' +
      '<h1 class="pv-hero-title">OPPIA<br><span>ROBOTICS</span></h1>' +
      '<p class="pv-hero-tagline">' + esc(hero.tagline) + '</p>' +
      '<p class="pv-muted pv-text">' + esc(hero.intro) + '</p>' +

      '<p class="pv-kicker pv-gap">Hakkımızda</p>' +
      '<h2 class="pv-title">' + esc(about.heading) + '</h2>' +
      '<p class="pv-muted pv-text">' + esc(about.text) + '</p>' +
      '<div class="pv-grid pv-grid-2"><div class="pv-mv"><p class="pv-name">Misyonumuz</p><p class="pv-muted pv-small">' + esc(about.mission) + '</p></div>' +
      '<div class="pv-mv"><p class="pv-name">Vizyonumuz</p><p class="pv-muted pv-small">' + esc(about.vision) + '</p></div></div>' +

      '<p class="pv-kicker pv-gap">Tarihçemiz</p>' +
      '<h2 class="pv-title">' + esc(history.heading) + '</h2>' +
      '<div class="pv-card pv-quote">' + esc(history.quote) + '</div>' +
      '<div class="pv-timeline">' + events + '</div>' +

      '<p class="pv-kicker pv-gap">İletişim</p>' +
      '<p class="pv-muted pv-text">' + esc(contact.intro) + '</p>' +
      '<div class="pv-card pv-contact"><p>✉ ' + esc(contact.email) + '</p><p>⌖ ' + esc(contact.address) + '</p>' +
      (socials ? '<ul class="pv-socials">' + socials + '</ul>' : '') + '</div>' +
    '</div>';
  });

  CMS.registerPreviewTemplate('site', SitePreview);
  CMS.registerPreviewTemplate('team', TeamPreview);
  CMS.registerPreviewTemplate('robots', RobotsPreview);
  CMS.registerPreviewTemplate('stats', StatsPreview);
  CMS.registerPreviewTemplate('awards', AwardsPreview);
  CMS.registerPreviewTemplate('gallery', GalleryPreview);
})();
