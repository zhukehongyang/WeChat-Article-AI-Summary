/**
 * 获取飞书多维表格的 table_id
 *
 * 使用方法:
 * 1. 先在 .env.local 中配置 FEISHU_APP_ID 和 FEISHU_APP_SECRET
 * 2. 运行: npx tsx scripts/get-feishu-table-id.ts
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// 从 .env.local 加载环境变量
function loadEnv() {
  const envPath = join(process.cwd(), '.env.local');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (value && !key.startsWith('#')) {
          process.env[key] = value;
        }
      }
    });
  } catch (error) {
    console.error('无法读取 .env.local 文件');
  }
}

loadEnv();

const appId = process.env.FEISHU_APP_ID;
const appSecret = process.env.FEISHU_APP_SECRET;
const appToken = process.env.FEISHU_BITABLE_APP_TOKEN;

if (!appId || !appSecret) {
  console.error('❌ 错误: 未设置 FEISHU_APP_ID 或 FEISHU_APP_SECRET');
  console.log('\n请在 .env.local 文件中添加:');
  console.log('FEISHU_APP_ID=cli_xxxxxxxxxxxxx');
  console.log('FEISHU_APP_SECRET=xxxxxxxxxxxxxxxxxxxx');
  process.exit(1);
}

async function getAccessToken() {
  const url = 'https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal';

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取 access_token 失败: ${data.msg}`);
  }

  return data.tenant_access_token;
}

async function getTableIdList() {
  const token = await getAccessToken();

  if (!appToken) {
    console.error('❌ 错误: 未设置 FEISHU_BITABLE_APP_TOKEN');
    console.log('\n请先在飞书中创建多维表格，然后从 URL 获取 app_token');
    console.log('URL 格式: https://xxx.feishu.cn/base/{app_token}/app{app_token}');
    console.log('\n然后在 .env.local 中添加:');
    console.log('FEISHU_BITABLE_APP_TOKEN=bascnxxxxxx');
    process.exit(1);
  }

  const url = `https://open.feishu.cn/open-apis/bitable/v1/apps/${appToken}/tables`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.code !== 0) {
    throw new Error(`获取表格列表失败: ${data.msg}`);
  }

  return data.data.items;
}

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 飞书多维表格 table_id 获取工具');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const tables = await getTableIdList();

    console.log(`✅ 找到 ${tables.length} 个数据表:\n`);

    tables.forEach((table: any, index: number) => {
      console.log(`${index + 1}. 表名: ${table.name}`);
      console.log(`   table_id: ${table.table_id}`);
      console.log('');
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('💡 下一步:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (tables.length === 1) {
      const tableId = tables[0].table_id;
      console.log(`找到 1 个表格，table_id 是: ${tableId}\n`);
      console.log('在 .env.local 中添加:');
      console.log(`FEISHU_TABLE_ID=${tableId}\n`);
    } else {
      console.log(`找到 ${tables.length} 个表格，请选择一个作为主表格。`);
      console.log('建议选择第一个或创建新表格时记录的 table_id。\n');
      console.log('在 .env.local 中添加:');
      console.log(`FEISHU_TABLE_ID=${tables[0].table_id}\n`);
    }

    console.log('添加后运行测试:');
    console.log('  npx tsx scripts/test-feishu.ts\n');

  } catch (error: any) {
    console.error('❌ 获取失败:', error.message);
    console.log('\n可能的原因:');
    console.log('1. FEISHU_APP_ID 或 FEISHU_APP_SECRET 不正确');
    console.log('2. FEISHU_BITABLE_APP_TOKEN 不正确');
    console.log('3. 应用未发布或未开启必要权限');
    console.log('4. 没有访问该多维表格的权限\n');
    console.log('请检查配置后重试。');
  }
}

main();
