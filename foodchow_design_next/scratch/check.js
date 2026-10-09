const https = require('https');

https.get('https://adminapi.foodchow.com/MenuMaster/MenuDetailWithChild?shopId=955', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const parsed = JSON.parse(data);
      if(parsed && parsed.data && parsed.data.length > 0) {
        const cat = parsed.data[0];
        console.log("Cat:", cat.cate_name);
        const item = cat.item_list.find(i => i.item_Name.includes('Buger1') || i.item_Name.includes('Burger') || i.item_Name.includes('BURGER'));
        if(item) {
          console.log("Found item keys:", Object.keys(item));
          console.log("Variant keys related:", Object.keys(item).filter(k => k.toLowerCase().includes('size') || k.toLowerCase().includes('variant') || k.toLowerCase().includes('price') || k.toLowerCase().includes('list')));
          const sizeList = item.itemSizeList || item.item_size_list || item.size_list || item.variantList || item.itemSize;
          console.log("Sizes:", JSON.stringify(sizeList, null, 2));
        } else {
          console.log("Item not found");
        }
      }
    } catch(e) { console.error(e); }
  });
});
