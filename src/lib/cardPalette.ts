export type CardColors = { bg: string; border: string; shadow: string };

export function cardColorsFor(slug?: string, name?: string): CardColors {
  const key = (slug || name || '').toLowerCase();

  // Cítrico Amanecer – melocotón/ámbar pastel
  if (/(citrico|cítrico|naranja|limon|amanecer)/.test(key)) {
    return {
      bg: 'linear-gradient(180deg, #FBE8BD 0%, #F2D3C2 100%)',
      border: '#F4DCC9',
      shadow: 'rgba(250, 196, 160, .45)',
    };
  }

  // Menta Alpina – salvia/teal pastel
  if (/(menta|mint|alpin|alpina)/.test(key)) {
    return {
      bg: 'linear-gradient(180deg, #DDEBDC 0%, #C9E9E5 100%)',
      border: '#D3E6DD',
      shadow: 'rgba(186, 223, 214, .45)',
    };
  }

  // Rosa Mosqueta – rosa pastel
  if (/(rosa|mosqueta|rose)/.test(key)) {
    return {
      bg: 'linear-gradient(180deg, #F9E0E6 0%, #F6C9D3 100%)',
      border: '#F5D6DE',
      shadow: 'rgba(244, 180, 195, .45)',
    };
  }

  // Carbón Activo – gris frío pastel (muy suave)
  if (/(carbon|carbón|charcoal|activo)/.test(key)) {
    return {
      bg: 'linear-gradient(180deg, #EEF1F3 0%, #E6ECF0 100%)',
      border: '#E2E8ED',
      shadow: 'rgba(179, 193, 204, .45)',
    };
  }

  // Por defecto – arena/mist pastel
  return {
    bg: 'linear-gradient(180deg, var(--sand-50, #FAF7F2) 0%, var(--mist-100, #F2F5F7) 100%)',
    border: 'var(--border-soft, #ECECEC)',
    shadow: 'rgba(0,0,0,.04)',
  };
}
