require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function makeAllFilesPublic() {
    console.log('🔍 Fetching all files in greensync/submissions folder...');

    try {
        // Get all raw type files (old uploads)
        const rawResult = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'raw',
            prefix: 'greensync/submissions',
            max_results: 500,
        });

        // Get all auto/image type files (new uploads)
        const imageResult = await cloudinary.api.resources({
            type: 'upload',
            resource_type: 'image',
            prefix: 'greensync/submissions',
            max_results: 500,
        });

        const allFiles = [
            ...rawResult.resources,
            ...imageResult.resources,
        ];

        console.log(`📁 Found ${allFiles.length} file(s) total`);

        if (allFiles.length === 0) {
            console.log('No files found.');
            return;
        }

        let fixed = 0;
        let failed = 0;

        for (const file of allFiles) {
            try {
                // Update access control to public
                await cloudinary.api.update(file.public_id, {
                    resource_type: file.resource_type,
                    access_control: [{ access_type: 'anonymous' }],
                });

                // Generate the correct public URL
                const publicUrl = cloudinary.url(file.public_id, {
                    resource_type: file.resource_type,
                    secure: true,
                    format: 'pdf',
                });

                console.log(`✅ Made public: ${file.public_id}`);
                console.log(`   URL: ${file.secure_url}`);
                fixed++;
            } catch (err) {
                console.log(`❌ Failed for ${file.public_id}: ${err.message}`);
                failed++;
            }
        }

        console.log('\n============================');
        console.log(`✅ Fixed: ${fixed} files`);
        console.log(`❌ Failed: ${failed} files`);
        console.log('============================');
        console.log('\n✅ Done! All existing submissions are now publicly accessible.');

    } catch (error) {
        console.error('Error:', error.message);
    }

    process.exit(0);
}

makeAllFilesPublic();
