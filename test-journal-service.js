import { journalService } from './src/services/journalService';

async function testJournalService() {
  console.log('=== Testing Journal Service ===');
  
  try {
    // Test 1: Create entry without images
    console.log('\n1. Testing createEntry without images...');
    const textEntry = await journalService.createEntry({
      content: '测试日记 - 纯文本',
      tags: ['测试', '文本'],
      timestamp: new Date().toISOString(),
    });
    console.log('✓ Text entry created:', textEntry.id);
    
    // Test 2: Create entry with images
    console.log('\n2. Testing createEntry with images...');
    const imageEntry = await journalService.createEntry({
      content: '测试日记 - 带图片',
      tags: ['测试', '图片'],
      timestamp: new Date().toISOString(),
      images: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
    });
    console.log('✓ Image entry created:', imageEntry.id);
    console.log('✓ Images included:', imageEntry.images);
    
    // Test 3: Get all entries
    console.log('\n3. Testing getEntries...');
    const entries = await journalService.getEntries();
    console.log('✓ Entries retrieved:', entries.length);
    console.log('✓ Latest entry:', entries[0]?.content);
    
    // Test 4: Batch import
    console.log('\n4. Testing batchImport...');
    await journalService.batchImport([
      {
        content: '批量导入测试 1',
        tags: ['批量', '测试'],
        timestamp: new Date().toISOString(),
      },
      {
        content: '批量导入测试 2 - 带图片',
        tags: ['批量', '图片'],
        timestamp: new Date().toISOString(),
        images: ['https://example.com/batch1.jpg'],
      },
    ]);
    console.log('✓ Batch import completed');
    
    // Test 5: Get entries again to verify batch import
    console.log('\n5. Testing getEntries after batch import...');
    const updatedEntries = await journalService.getEntries();
    console.log('✓ Updated entries count:', updatedEntries.length);
    
    console.log('\n=== All tests passed! ===');
    
  } catch (error) {
    console.error('✗ Test failed:', error);
  }
}

testJournalService();