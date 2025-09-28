import { useQuery } from '@tanstack/react-query'
import productService from '../services/productService'

export default function ProductFilters({ 
  selectedCategory, 
  selectedSubCategory, 
  onSubCategoryChange 
}) {
  
  // Get sub categories for selected main category
  const { data: subCategories } = useQuery({
    queryKey: ['sub-categories', selectedCategory],
    queryFn: () => selectedCategory ? productService.getSubGroups(selectedCategory) : Promise.resolve({ success: true, data: [] }),
    enabled: !!selectedCategory,
    select: (data) => data.success ? data.data : [],
  })

  if (!selectedCategory) {
    return null
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Detaylı Filtreler</h4>
      
      {/* Sub Category Filter */}
      {subCategories && subCategories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Alt Kategori
          </label>
          <select
            value={selectedSubCategory}
            onChange={(e) => onSubCategoryChange(e.target.value)}
            className="w-full py-2 px-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-kristal-500 focus:border-kristal-500"
          >
            <option value="">Tüm Alt Kategoriler</option>
            {subCategories.map(subCat => (
              <option key={subCat.grpkod} value={subCat.grpkod}>
                {subCat.grpadi}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}