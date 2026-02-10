
import { PrismaClient, UserRole, MotorbikeType, MotorbikeStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seed started...');

    // 1. Clear existing data
    await prisma.review.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.rental.deleteMany();
    await prisma.motorbike.deleteMany();
    await prisma.blog.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    const hashedPassword = await bcrypt.hash('123456', 10);

    const admin = await prisma.user.create({
        data: {
            email: 'admin@goride.com',
            password: hashedPassword,
            name: 'Admin GoRide',
            role: 'ADMIN',
            phone: '0987654321',
        },
    });

    const customer = await prisma.user.create({
        data: {
            email: 'customer@gmail.com',
            password: hashedPassword,
            name: 'Nguyễn Văn A',
            role: 'CUSTOMER',
            phone: '0123456789',
        },
    });

    console.log('Users created:', { admin: admin.email, customer: customer.email });

    // 3. Create Motorbikes
    const motorbikes = [
        {
            name: 'Honda Wave RSX',
            type: MotorbikeType.MANUAL,
            pricePerDay: 150000,
            description: 'Xe số đời mới, tiết kiệm xăng, phù hợp đi trong phố.',
            status: MotorbikeStatus.AVAILABLE,
            licensePlate: '29A-123.45',
            year: 2022,
            images: ['https://images.unsplash.com/photo-1558981403-c5f91eb1238e'],
            fuelCapacity: '4.0 L',
            engineSize: '110cc',
        },
        {
            name: 'Honda Air Blade 125',
            type: MotorbikeType.SCOOTER,
            pricePerDay: 250000,
            description: 'Xe ga sang trọng, động cơ mạnh mẽ, cốp rộng.',
            status: MotorbikeStatus.AVAILABLE,
            licensePlate: '29B-567.89',
            year: 2023,
            images: ['https://images.unsplash.com/photo-1591637333184-19aa84b3e01f'],
            fuelCapacity: '4.4 L',
            engineSize: '125cc',
        },
        {
            name: 'Yamaha Exciter 155',
            type: MotorbikeType.SEMI_AUTO,
            pricePerDay: 300000,
            description: 'Xe côn tay thể thao, phong cách trẻ trung.',
            status: MotorbikeStatus.AVAILABLE,
            licensePlate: '29C-999.99',
            year: 2023,
            images: ['https://images.unsplash.com/photo-1622185135505-2d795003994a'],
            fuelCapacity: '5.4 L',
            engineSize: '155cc',
        },
        {
            name: 'Honda Vision',
            type: MotorbikeType.SCOOTER,
            pricePerDay: 200000,
            description: 'Xe ga nhỏ gọn, dễ điều khiển, phù hợp cho nữ.',
            status: MotorbikeStatus.AVAILABLE,
            licensePlate: '29D-111.22',
            year: 2021,
            images: ['https://images.unsplash.com/photo-1568772585407-9363f9bf3a87'],
            fuelCapacity: '5.2 L',
            engineSize: '110cc',
        },
        {
            name: 'Honda SH 150i',
            type: MotorbikeType.SCOOTER,
            pricePerDay: 500000,
            description: 'Xe ga cao cấp, đẳng cấp thượng lưu.',
            status: MotorbikeStatus.AVAILABLE,
            licensePlate: '29E-888.88',
            year: 2023,
            images: ['https://images.unsplash.com/photo-1620050854445-5654314c94f0'],
            fuelCapacity: '7.8 L',
            engineSize: '150cc',
        },
    ];

    for (const motorbike of motorbikes) {
        await prisma.motorbike.create({ data: motorbike });
    }

    // 4. Create Blogs
    const blogs = [
        {
            tag: 'Kinh nghiệm',
            title: 'Top 10 cung đường ven biển đẹp nhất Việt Nam bằng xe máy',
            description: 'Khám phá những hành trình đầy mê hoặc từ Bắc chí Nam cùng bạn bè...',
            content: 'Nội dung chi tiết về các cung đường ven biển như Phan Thiết - Mũi Né, Đèo Lương Sơn - Đại Lãnh...',
            image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957',
        },
        {
            tag: 'Cẩm nang',
            title: 'Bí quyết bỏ túi khi thuê xe máy tại Quy Nhơn an toàn nhất',
            description: 'Những lưu ý quan trọng về giấy tờ và kiểm tra xe trước khi nhận...',
            content: 'Khi thuê xe tại Quy Nhơn, bạn cần kiểm tra lốp xe, phanh và giấy tờ xe đầy đủ...',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8df0',
        },
    ];

    for (const blog of blogs) {
        await prisma.blog.create({ data: blog });
    }

    // 5. Create Promotions
    const promotions = [
        {
            badge: '20% OFF',
            title: 'Chào bạn mới',
            description: 'Giảm ngay 20% cho chuyến đi đầu tiên',
            image: 'https://images.unsplash.com/photo-1616634375264-2d2e17736a36',
        },
        {
            badge: '15% OFF',
            title: 'Cuối tuần rực rỡ',
            description: 'Thuê xe cuối tuần, nhận ưu đãi hấp dẫn',
            image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8df0',
        },
    ];

    for (const promo of promotions) {
        await prisma.promotion.create({ data: promo });
    }

    console.log('Motorbikes created:', motorbikes.length);
    console.log('Blogs created:', blogs.length);
    console.log('Promotions created:', promotions.length);
    console.log('Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
