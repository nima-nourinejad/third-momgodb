const mongoose = require("mongoose");



async function clearDatabase() {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const { name } of collections) {
      await db.collection(name).deleteMany({});
      console.log(`Cleared all documents from ${name}`);
    }

    console.log(`All collections in ${db.databaseName} cleared successfully.`);
  } catch (err) {
    console.error("Error clearing the database: ", err);
  }
}

async function clearCollection(name) {
  try {
    const db = mongoose.connection.db;
    await db.collection(name).deleteMany({});
    console.log(`Cleared all documents from ${name}`);
  } catch (err) {
    console.error(`Error clearing collection ${name}: `, err);
  }
}

async function dropCollection(name) {
  try {
    const db = mongoose.connection.db;
    await db.collection(name).drop();
    console.log(`Dropped collection ${name}`);
  } catch (err) {
    console.error(`Error dropping collection ${name}: `, err);
  }
}

async function forgetModelAndSchema(name) {
  try {
    delete mongoose.models[name];
    delete mongoose.modelSchemas[name];
    console.log(`Forgot model and schema for ${name}`);
  } catch (err) {
    console.error(`Error forgetting model and schema for ${name}: `, err);
  }
}

async function reloadDatabase() {
  try {
    await createDocument("Document 1", "Author 1", ["tag1", "tag2"], true);
    await createDocument("Document 2", "nima", ["tag3", "tag4"], false);
    console.log("Database reloaded successfully.");
  } catch (err) {
    console.error("Error reloading the database: ", err);
  }
}

// async function connectToDatabase() {
//   try {
//     const connectionString = "mongodb://localhost";
//     const dbName = "dbName";
//     await mongoose.connect(`${connectionString}/${dbName}`);
//     console.log(`Connected to MongoDB at ${connectionString}/${dbName}`);
//   } catch (err) {
//     console.error("Error connecting to MongoDB: ", err);
//   }
// }

async function connectToDatabase() {
  try {
    const user = "nima";
    const password = "123";
    const cluster = "cluster0.gpkfp.mongodb.net";
    const dbName = "dbName";
    const options = "retryWrites=true&w=majority";

    // Construct the connection string
    const connectionString = `mongodb+srv://${user}:${password}@${cluster}`;
    const uri = `${connectionString}/${dbName}?${options}`;

    console.log("Constructed URI:", uri);

    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB: ", err);
  }
}

// async function connectToDatabase() {
// 	const config = {
// 	  user: "nima",
// 	  password: "123",
// 	  cluster: "cluster0",
// 	  dbName: "dbName",
// 	  options: "retryWrites=true&w=majority"
// 	};

// 	const connectionString = `mongodb+srv://${config.user}:${config.password}@${config.cluster}`;

// 	try {
// 	  await mongoose.connect(`${connectionString}/${config.dbName}?${config.options}`);
// 	  console.log(`Connected to MongoDB at ${connectionString}/${config.dbName}`);
// 	} catch (error) {
// 	  console.error("Error connecting to MongoDB:", error);
// 	}
//   }

async function dropAllCollections() {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    for (const { name } of collections) {
      await db.collection(name).drop();
      console.log(`Dropped collection ${name}`);
    }

    console.log(`All collections in ${db.databaseName} dropped successfully.`);
  } catch (err) {
    console.error("Error dropping all collections: ", err);
  }
}

async function fullProcess() {
  await connectToDatabase();
  //   await clearDatabase();
  //   await clearCollection("collectionName_s_WillBeAdded" + "s");
  //   await dropCollection("collectionName_s_WillBeAdded" + "s");
  await dropAllCollections();
  await reloadDatabase();
  await getDocuments();
  await updateDocument_QueryFirst(
    "675bd87608e34bdf31d11d99",
    "New Name",
    "New Author"
  );
  await updateDocument_UpdateDirectly(
    "675bd87608e34bdf31d11d99",
    "New Name",
    "New Author"
  );
  await updateDocument_findAndUpdate(
    "675bd87608e34bdf31d11d99",
    "New Name",
    "New Author"
  );

  //
  await deleteDocument_deleteMany({ author: "nima" });
  await deleteDocument("675bd87608e34bdf31d11d99");
  await deleteDocument_findByIdAndRemove("675bd87608e34bdf31d11d99");
}

const schema = new mongoose.Schema({
  //   name: { type: String, required: true },
  name: {
    type: String,
    required: function () {
      return this.isPublished;
    },
  },
  author: String,
  tags: [String],
  date: { type: Date, default: Date.now },
  isPublished: Boolean,
});

const Model = mongoose.model("collectionName_s_WillBeAdded", schema);

async function createDocument(
  documentName,
  documentAuthor,
  documentTags,
  documentIsPublished
) {
  try {
    const document = new Model({
      name: documentName,
      author: documentAuthor,
      tags: documentTags,
      isPublished: documentIsPublished,
    });

    const result = await document.save();
    console.log("document : saved");
  } catch (err) {
    console.error("Error creating document: ", err);
  }
}

async function getDocuments() {
  try {
    const documents = await Model.find({ author: "nima" })
      .limit(10)
      .sort({ name: 1 })
      .select({ name: 1, tags: 1 });
    console.log("From find");
    console.log(documents);
  } catch (err) {
    console.error("Error getting documents: ", err);
  }
}

async function updateDocument_QueryFirst(id, newName, newAuthor) {
  try {
    const document = await Model.findById(id);
    if (!document) {
      console.log("update faild : document not found");
      return;
    }
    document.name = newName;
    document.author = newAuthor;
    // document.set({ name: newName, author: newAuthor });
    const result = await document.save();
    console.log("document : updated");
    console.log(result);
  } catch (err) {
    console.error("Error updating document: ", err);
  }
}

async function updateDocument_UpdateDirectly(id, newName, newAuthor) {
  try {
    const result = await Model.updateOne(
      { _id: id },
      {
        $set: {
          name: newName,
          author: newAuthor,
        },
      }
    );
    // const result = await Model.updateMany(
    //   { _id: id },
    //   {
    //     $set: {
    //       name: newName,
    //       author: newAuthor,
    //     },
    //   }
    // );
    console.log("document : updated");
    console.log(result);
  } catch (err) {
    console.error("Error updating document: ", err);
  }
}

async function updateDocument_findAndUpdate(id, newName, newAuthor) {
  try {
    const result = await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          name: newName,
          author: newAuthor,
        },
      },
      { new: true }
    );
    console.log("document : updated");
    console.log(result);
  } catch (err) {
    console.error("Error updating document: ", err);
  }
}

async function deleteDocument(id) {
  try {
    const result = await Model.deleteOne({ _id: id });
    console.log(result);
  } catch (err) {
    console.error("Error deleting document: ", err);
  }
}

async function deleteDocument_findByIdAndRemove(id) {
  try {
    const result = await Model.findByIdAndDelete(id);
    console.log(`Deleted document with id ${id}: ${result}`);
  } catch (err) {
    console.error("Error deleting document: ", err);
  }
}

async function deleteDocument_deleteMany(filter) {
  try {
    const result = await Model.deleteMany(filter);
    console.log(result);
  } catch (err) {
    console.error("Error deleting document: ", err);
  }
}

fullProcess();
