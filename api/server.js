require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId} = require('mongodb');
const path = require('path');

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = process.env.MONGO_URI;
let db, Playerinfo, Winnerinfo;

// Function to connect to MongoDB
async function connectDB() {
    try {
        const client = await MongoClient.connect(uri); //{ useNewUrlParser: true, useUnifiedTopology: true });
        console.log('✅ Connected to MongoDB');
        db = client.db('gameAppDB');
        Playerinfo = db.collection('player');
        Winnerinfo = db.collection('winner');
    } catch (error) {
        console.error('❌ Error connecting to MongoDB:', error);
    }
}

// Call the function to connect
connectDB();

// API to add a player
app.post('/add-player', async (req, res) => {
    try {
        //console.log("📩 Received Data:", req.body); // Debugging line
        const { name, contact, email } = req.body;

        if (!name || !contact || !email) {
            return res.status(400).json({ error: "All fields are required!" });
        }

        const newPlayer = { name, contact, email };

        // Insert into MongoDB
        const result = await Playerinfo.insertOne(newPlayer);

        res.status(201).json({ 
            message: "✅ Player added successfully!", 
            playerId: result.insertedId 
        });

    } catch (error) {
        console.error("❌ Error adding player:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

//API to get the player data
app.get('/get-player', async(req, res)=> {
    try {
        if (!Playerinfo) {
            return res.status(500).json({ success: false, message: "Database not connected" });
        }
        const players = await db.collection("player").find({}).toArray();
        //console.log("Player fetched from DB:", players)
        res.status(200).json({
            success: true,
            message: "Players fetched successfully",
            data: players,
        });
    }catch(error) {
        console.log('Error getting the data:', error);
        res.status(500).json({message: "Internal server error"});
    }
});

//API to update player
app.put("/api/player/:id", async (req, res) => {
    try {
        if (!Playerinfo) {
            return res.status(500).json({ success: false, message: "Database not initialized" });
        }
        const playerId = req.params.id;
        const updatedData = req.body;

        // ✅ Ensure `Playerinfo` collection is available

        if (!ObjectId.isValid(playerId)) {
            return res.status(400).json({ success: false, message: "Invalid player ID" });
        }

        const result = await Playerinfo.updateOne(
            { _id: new ObjectId(playerId) },
            { $set: updatedData }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ success: false, message: "Player not found or no changes made" });
        }

        res.json({ success: true, message: "Player updated successfully" });

    } catch (error) {
        console.error("❌ Error updating player:", error);
        res.status(500).json({ success: false, message: "Server error!" });
    }
});

//API to get single player
app.get("/api/player/:id", async(req, res) =>{
    try{
        if(!Playerinfo) {
            return res.status(404).json({success: false, message:"Database not initialized"});
        }
        const playerId = req.params.id;
        
        if(!ObjectId.isValid(playerId)) {
            return res.status(400).json({success: false, message:"Invalid player ID"});
        }
        const player = await Playerinfo.findOne({_id: new ObjectId(playerId)});
        if(!player) {
            return res.status(404).json({success:false, message:"Player not found!"});
        }
        res.json({success: true, data: player});

    }catch(error){
        console.error("Error getting player", error);
        res.status(500).json({success: false, message:"Server error"})
    };
});

//API to delete the player 
app.delete("/api/player/:id", async (req, res) => {
    try {
        const playerID = req.params.id;

        // Validate ObjectId before proceeding
        if (!ObjectId.isValid(playerID)) {
            return res.status(400).json({ success: false, message: "Invalid Player ID format" });
        }

        const player = await Playerinfo.findOne({ _id: new ObjectId(playerID) });

        if (!player) {
            return res.status(404).json({ success: false, message: "Player not found" });
        }

        const result = await Playerinfo.deleteOne({ _id: new ObjectId(playerID) });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, message: "Player not found" });
        }

        res.status(200).json({ success: true, message: "Player deleted successfully." });

    } catch (error) {
        console.error("Error deleting player:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

//API to add the winner 
app.post("/winner", async (req, res) => {
    try {
        //console.log("Received Request Body:", req.body); // Debug received data

        const { winner, matchPlayers } = req.body;

        // Check if data is correctly received
        if (!winner || !matchPlayers || !Array.isArray(matchPlayers)) {
            console.error("Invalid Request Data:", { winner, matchPlayers });
            return res.status(400).json({ success: false, message: "Winner name and match players list are required." });
        }

        const playerExists = await db.collection("player").findOne({ name: winner });
        if (!playerExists) {
            console.error("Winner not found in DB:", winner);
            return res.status(404).json({ success: false, message: "Winner not found in the database." });
        }

        // Increase wins for winner & increase totalMatches
        await db.collection("player").updateOne(
            { name: winner },
            { $inc: { wins: 1, totalMatches: 1 } }
        );

        // Increase losses & totalMatches for other players in the match
        await db.collection("player").updateMany(
            { name: { $in: matchPlayers, $ne: winner } },
            { $inc: { losses: 1, totalMatches: 1 } }
        );

        console.log(`${winner} declared as winner!`);
        res.json({ success: true, message: `${winner} declared as winner!` });

    } catch (error) {
        console.error("Error adding winner", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

// Serve the HTML file
/*app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});*/

// Start the server
app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
});
