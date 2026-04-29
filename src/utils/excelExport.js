export const exportToExcel = (data, filename) => {
  const worksheet = data.map(item => ({
    'Tarih': item.wtarih,
    'İşlem Türü': item.wisad,
    'Belge No': item.wbelge,
    'Vade': item.wvade,
    'Borç': item.wborc,
    'Alacak': item.walacak,
    'Bakiye': item.wbakiye,
    'Açıklama': item.wacik
  }))

  // SheetJS implementation buraya gelecek
  console.log('Excel export:', worksheet)
}