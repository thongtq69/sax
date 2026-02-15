const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://quocthong1290_db_user:TZzVNqXP9gALfcIq@cluster0.bbs1yqz.mongodb.net/ptn_english?appName=Cluster0";

const adSchema = new mongoose.Schema({
    isActive: Boolean,
    leftImage: String,
    leftLabel: String,
}, { strict: false });

const Advertisement = mongoose.models.Advertisement || mongoose.model('Advertisement', adSchema);

async function main() {
    await mongoose.connect(MONGODB_URI);
    const count = await Advertisement.countDocuments();
    const active = await Advertisement.find({ isActive: true });
    console.log('Total Ads in PTN:', count);
    console.log('Active Ads in PTN:', active.length);
    if (active.length > 0) {
        console.log('Active Ad:', JSON.stringify(active[0], null, 2));
    }
    await mongoose.disconnect();
}

main().catch(console.error);
