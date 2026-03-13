import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPromotion() {
    console.log('--- Bắt đầu kiểm tra hệ thống Ưu đãi ---');

    try {
        // 1. Tìm hoặc tạo người dùng và xe máy mẫu
        let user = await prisma.user.findFirst({ where: { email: 'customer@gmail.com' } });
        let motorbike = await prisma.motorbike.findFirst();

        if (!user || !motorbike) {
            console.error('Lỗi: Cần chạy lệnh seed trước khi chạy test này.');
            return;
        }

        console.log(`Đang test với người dùng: ${user.email}`);
        console.log(`Đang test với xe: ${motorbike.name} (Giá: ${motorbike.pricePerDay}/ngày)`);

        // 2. Tạo mã ưu đãi test (giảm 20%, đơn tối thiểu 200k)
        const testCode = 'TEST20PERCENT';
        await (prisma.promotion as any).upsert({
            where: { code: testCode },
            update: {
                discountType: 'PERCENTAGE',
                discountValue: 20,
                minOrderValue: 200000,
                isActive: true,
                startDate: new Date(Date.now() - 86400000), // Hôm qua
                endDate: new Date(Date.now() + 86400000),   // Ngày mai
            },
            create: {
                title: 'Test Promo 20%',
                description: 'Dùng để kiểm tra tự động',
                code: testCode,
                discountType: 'PERCENTAGE',
                discountValue: 20,
                minOrderValue: 200000,
                isActive: true,
            }
        });

        console.log(`\n1. Kiểm tra mã giảm giá % (${testCode}):`);
        // Giả lập tính tiền: Thuê 2 ngày xe Honda Wave (150k/ngày) = 300k
        // Giảm 20% của 300k là 60k => Còn 240k
        const days = 2;
        const rawPrice = Number(motorbike.pricePerDay) * days;
        console.log(`- Giá gốc (${days} ngày): ${rawPrice.toLocaleString()} VNĐ`);

        // Gọi logic tính tiền (đã viết trong RentalService, ở đây ta giả lập lại theo đúng logic đó)
        let finalPrice = rawPrice;
        const promo = await (prisma.promotion as any).findFirst({ where: { code: testCode, isActive: true } });
        
        if (promo && rawPrice >= Number(promo.minOrderValue)) {
            if (promo.discountType === 'PERCENTAGE') {
                finalPrice -= (rawPrice * Number(promo.discountValue)) / 100;
            }
        }

        console.log(`- Giá sau giảm: ${finalPrice.toLocaleString()} VNĐ`);
        
        // Check calculation correctly
        const expectedPrice = rawPrice * 0.8;
        if (finalPrice === expectedPrice) {
            console.log('✅ KẾT QUẢ: Hợp lệ!');
        } else {
            console.log(`❌ KẾT QUẢ: Sai lệch giá tiền! (Mong đợi ${expectedPrice.toLocaleString()}, thực tế ${finalPrice.toLocaleString()})`);
        }

        // 3. Kiểm tra điều kiện đơn tối thiểu
        console.log(`\n2. Kiểm tra điều kiện đơn tối thiểu (Ví dụ đơn 100k < 200k tối thiểu):`);
        const smallPrice = 100000;
        let finalSmallPrice = smallPrice;
        if (promo && smallPrice >= Number(promo.minOrderValue)) {
            finalSmallPrice -= (smallPrice * Number(promo.discountValue)) / 100;
        }
        console.log(`- Giá gốc: ${smallPrice.toLocaleString()} VNĐ`);
        console.log(`- Giá sau áp mã: ${finalSmallPrice.toLocaleString()} VNĐ`);
        if (finalSmallPrice === smallPrice) {
            console.log('✅ KẾT QUẢ: Không giảm giá (Đúng vì chưa đạt mức tối thiểu)');
        } else {
            console.log('❌ KẾT QUẢ: Vẫn giảm giá (Sai)');
        }

        console.log('\n--- Hoàn tất kiểm tra ---');

    } catch (error) {
        console.error('Lỗi khi chạy test:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testPromotion();
