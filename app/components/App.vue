<template>
  <Page>
    <ActionBar>
      <Label class="title" text="300 px Fotoğraf Ekleme" col="1" />
    </ActionBar>

    <GridLayout columns="*" rows="330,60,60,60">
      <Image :src="photo" stretch="aspectFill" row="0" height="300" width="300" />
      <!-- <Image :src="file" stretch="aspectFill" row="0" height="300" width="300" /> -->
      <Button text="foto çek" @tap="take" row="1" class="p-5 font-weight-bold" />
      <Label v-show="boyut.length > 0" :text="'Resim boyutu: ' + boyut" textWrap="true" row="2" class="text-center h3 p-5" />
      <Button v-show="photo" text="Gönder" @tap="send" row="3" class="font-weight-bold" />
    </GridLayout>
  </Page>
</template>

<script lang="ts">
import * as camera from "nativescript-camera";
import { Image } from "tns-core-modules/ui/image";
import { ImageSource, fromFile, fromResource, fromBase64 } from "tns-core-modules/image-source";
import { Folder, path, knownFolders } from "tns-core-modules/file-system";
import { isAndroid, isIOS } from "tns-core-modules/platform";
import { HttpResponse } from "tns-core-modules/http";
import { request, HTTPFormData, HTTPFormDataEntry } from "@klippa/nativescript-http";
export default {
  data() {
    return {
      // arrayPictures: [],
      photo: null,
      photoPath: "",
      fileName: "",
      boyut: "",
    };
  },
  methods: {
    take() {
      camera
        .takePicture({
          width:  300,
          height: 300,
          keepAspectRatio: true,
        })
        .then((imageAsset) => {
          console.log("Size: " + imageAsset.options.width + "x" + imageAsset.options.height);
          this.boyut = imageAsset.options.width + "x" + imageAsset.options.height;
          console.log("keepAspectRatio: " + imageAsset.options.keepAspectRatio);
          // SAVE IMAGE
          ImageSource.fromAsset(imageAsset).then((imageSource: ImageSource) => {
            const fileName: string = "kus" + "-" + new Date().getTime() + ".jpeg";
            this.fileName = fileName;
            const folderPath: string = knownFolders.documents().path;
            const filePath: string = path.join(folderPath, fileName);
            const saved: boolean = imageSource.saveToFile(filePath, "jpeg");
            if (saved) {
              console.log("Saved: " + filePath);
              this.photoPath = filePath;
              console.log("Image saved successfully!");
            } else {
              console.log("not saved");
            }
            const loadedImage: ImageSource = ImageSource.fromFileSync(filePath);
            this.photo = loadedImage;
            console.log("this.photo :>> ", this.photo);
          });
        })
        .catch((err) => {
          console.log("Error -> " + err.message);
        });
    },
    send() {
      console.log("this.photoPath :>> ", this.photoPath);
      console.log("this.photo :>> ", this.photo);
      console.log('this.fileName :>> ', this.fileName);
      console.log('this.photo.android :>> ', this.photo.android);
      const form = new HTTPFormData();
      const formFile = new HTTPFormDataEntry(new java.io.File(this.photoPath), this.fileName, "image/jpeg");
      form.append("files", formFile);
      request({
        url: "http://192.168.0.2:1515/upload",
        method: "POST",
        content: form,
      }).then(
        (response: HttpResponse) => {
          console.log('response :>> ', response);
        },
        (e) => {
          console.log('e :>> ', e);
        }
      );
    },
    /*     takeResize() {
      
      camera
        .takePicture({
          width: 500, //these are in device independent pixels
          height: 500, //only one will be respected depending on os/device if
          keepAspectRatio: true, //    keepAspectRatio is enabled.
          saveToGallery: false, //Don't save a copy in local gallery, ignored by some Android devices
        })
        .then((imageAsset) => {
          imageAsset.options.autoScaleFactor = false;
          imageAsset.options.keepAspectRatio = true;
          ImageSource.fromAsset(imageAsset).then((imageSource) => {
            var ratio = 1,
              newheight = imageSource.height,
              newwidth = imageSource.width;
            if (imageSource.width > 500 && imageSource.height > 500) {
              if (imageSource.width > imageSource.height) {
                newwidth = 500;
                newheight = Math.round(500 * (imageSource.height / imageSource.width));
              } else {
                newheight = 500;
                newwidth = Math.round(500 * (imageSource.width / imageSource.height));
              }
            }
            if (imageSource.width > 500 && imageSource.height > 500) {
              if (isAndroid) {
                try {
                  var downsampleOptions = new android.graphics.BitmapFactory.Options();
                  var bitmap = android.graphics.BitmapFactory.decodeFile(imageAsset.android, null);
                  var newBitmap = android.graphics.Bitmap.createScaledBitmap(bitmap, newwidth, newheight, true);
                  imageSource.setNativeSource(newBitmap);
                  let filename = "image-" + new Date().getTime() + ".jpg";
                  const folderNew = knownFolders.documents().path;
                  let realPath = path.join( folderNew , filename);
                  imageSource.saveToFile(realPath, "jpeg");
                  // imageSource.filename = filename;
                  // imageSource.note = "";
                  this.photo = imageSource;
                  // that.storeData();
                } catch (err) {
                  console.error(err);
                }
              } else {
                let manager = PHImageManager.defaultManager();
                let options = new PHImageRequestOptions();
                options.resizeMode = PHImageRequestOptionsResizeMode.Exact;
                options.deliveryMode = PHImageRequestOptionsDeliveryMode.HighQualityFormat;
                manager.requestImageForAssetTargetSizeContentModeOptionsResultHandler(
                  imageAsset.ios,
                  { width: newwidth, height: newheight },
                  PHImageContentMode.AspectFill,
                  options,
                  function(result, info) {
                    let folder = knownFolders.documents().path;
                    let filename = "image-" + new Date().getTime() + ".jpg";
                    let realPath = path.join(folder, filename);
                    const loadedImage: ImageSource = ImageSource.fromFileSync(realPath)
                    // let newasset = imageAsset(result);

                    ImageSource.fromAsset(loadedImage).then((newimageSource) => {
                      newimageSource.saveToFile(realPath, "jpeg");
                      // newimageSource.filename = filename;
                      // newimageSource.note = "";
                      that.arrayPictures.unshift(newimageSource);
                      that.storeData();
                    });
                  }
                );
              }
            } else {
              let filename = "image" + "-" + new Date().getTime() + ".jpg";
              let folder = fsModule.knownFolders.documents();
              let path = fsModule.path.join(folder.path, filename);
              imageSource.saveToFile(path, "jpeg");
              imageSource.filename = filename;
              imageSource.note = "";
              that.arrayPictures.unshift(imageSource);
              that.storeData();
            }
          });
        });
    }, */
  },
  mounted() {
    camera.requestPermissions().then(
      //request permissions for camera
      (success) => {
        //have permissions
      },
      (failure) => {
        //no permissions for camera
      }
    );
  },
};
</script>

<style scoped></style>
