 const mongoose = require("mongoose")
 const Document = require("./Document")


 mongoose.connect('mongodb://localhost/docsDb', {
     useNewUrlParser: true,
     useUnifiedTopology: true,
     useFindAndModify: false,
     useCreateIndex: true
 });

 const io = require("socket.io")(3001, {
     cors: {
         origin: "http://localhost:3000",
         methods: ["GET", "POST"]
     }
 })


 io.on("connection", socket => {
     socket.on("get-document", async documentID => {
         console.log(documentID)
         const document = await findDocument(documentID)
         socket.join(documentID)
         socket.emit("load-document", document.data)
         console.log(document.data)

         socket.on("send-changes", delta => {
             socket.broadcast.to(documentID).emit("receive-changes", delta)
             console.log(delta)
         })
         socket.on("save-document", async data => {
             console.log('data saved')
             await Document.findByIdAndUpdate(documentID, { data })
         })
     })

 })

 async function findDocument(docId) {
     if (docId == null)
         return

     const document = await Document.findById(docId)

     if (document) {
         return document
     }

     return createDocument(docId)

 }

 async function createDocument(docId) {
     const defaultDocContent = "Start Typing...."

     return await Document.create({
         _id: docId,
         data: defaultDocContent
     })
 }