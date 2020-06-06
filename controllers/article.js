'use strict'

const validator = require('validator');
const Article = require('../models/article');
const fs = require('fs');
const path = require('path');

var controller = {

    /* -------------------------------------------------------------------------- */
    /*                      Metodo para guardar los artículos                     */
    /* -------------------------------------------------------------------------- */

    save: (req, res) => {

        /* --------------------------- Recoger parametros --------------------------- */

        let params = req.body;

        /* ------------------------------ Validar datos ----------------------------- */

        try {

            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);

        } catch (err) {
            return res.status(400).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            })
        }

        if (validate_title && validate_content) {

            /* ------------------------ Crear el objeto a guardar ----------------------- */

            let article = new Article();

            /* ----------------------------- Asignar valores ---------------------------- */

            article.title = params.title;
            article.content = params.content;
            article.image = null;

            /* --------------------------- Guardar el articulo -------------------------- */

            article.save((err, articleStored) => {

                if (err || !articleStored) {
                    return res.status(400).send({
                        status: 'error',
                        message: 'El articulo no se guardó'
                    })
                }

                /* --------------------------- Devolver respuesta --------------------------- */

                return res.status(201).send({
                    status: 'success',
                    article: articleStored,

                });
            });
        } else {

            return res.status(400).send({
                status: 'error',
                message: 'Los datos no son validos'
            })
        }
    },

    /* -------------------------------------------------------------------------- */
    /*                      Método para obtener los artículos                     */
    /* -------------------------------------------------------------------------- */

    getArticles: (req, res) => {

        let query = Article.find({});

        let last = req.params.last;

        if (last || last != undefined) {
            query.limit(5);
        }

        /* -------------------------- Buscamos el artículo -------------------------- */

        query.sort('-_id').exec((err, articles) => {

            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error al devolver los artículos'
                });
            }

            if (!articles) {
                return res.status(400).send({
                    status: 'error',
                    message: 'No hay artículos para mostrar'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        })
    },

    /* -------------------------------------------------------------------------- */
    /*                    Método para obtener un solo artículo                    */
    /* -------------------------------------------------------------------------- */

    getArticle: (req, res) => {

        /* ------------------------- Recoger el id de la ulr ------------------------ */

        let articleId = req.params.id;

        /* -------------------------- Comprobar que existe -------------------------- */

        if (!articleId || articleId == null) {

            return res.status(400).send({
                status: 'error',
                message: 'No existe ese artículo'
            });
        }

        /* --------------------------- Buscar el articulo --------------------------- */

        Article.findById(articleId, (err, article) => {

            if (err || !article) {
                return res.status(404).send({
                    status: 'error',
                    message: 'No existe el artículo'
                });
            }

            /* --------------------------- Devolverlo en JSON --------------------------- */

            return res.status(200).send({
                status: 'success',
                article
            });
        });
    },

    /* -------------------------------------------------------------------------- */
    /*                      Actualizar un artículo existente                      */
    /* -------------------------------------------------------------------------- */

    update: (req, res) => {

        /* ----------------------- Recoger el id del artículo ----------------------- */

        let articleId = req.params.id;

        /* ------------------ Recoger los datos que llegan por put ------------------ */

        let params = req.body;

        /* ------------------------------ Validar datos ----------------------------- */

        try {
            var validate_title = !validator.isEmpty(params.title);
            var validate_content = !validator.isEmpty(params.content);
        } catch (err) {
            return res.status(404).send({
                status: 'error',
                message: 'Faltan datos por enviar'
            });
        }

        if (validate_title && validate_content) {

            /* ------------------------- Encontrar y actualizar ------------------------- */

            Article.findOneAndUpdate({ _id: articleId }, params, { new: true }, (err, articleUpdate) => {
                if (err) {
                    return res.status(500).send({
                        status: 'error',
                        message: 'Error al actualizar'
                    });
                }

                if (!articleUpdate) {
                    return res.status(404).send({
                        status: 'error',
                        message: 'No existe el artículo'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdate,
                });
            });

            /* ----------------------- Devolver respuesta en JSON ----------------------- */
        } else {

            return res.status(400).send({
                status: 'error',
                message: 'La validación no es correcta'
            });
        }

    },

    /* -------------------------------------------------------------------------- */
    /*                       Método para eliminar artículos                       */
    /* -------------------------------------------------------------------------- */

    delete: (req, res) => {

        /* ------------------------- Recoger el id de la url ------------------------ */

        let articleId = req.params.id;

        /* ---------------------------- Buscar y eliminar --------------------------- */

        Article.findOneAndDelete({ _id: articleId }, (err, articleRemove) => {
            if (err) {

                return res.status(500).send({
                    status: 'error',
                    message: 'Error al borrar'
                });

            }

            if (!articleRemove) {

                return res.status(404).send({
                    status: 'error',
                    message: 'No se ha borrado el articulo, probablemente no exista'
                });
            }


            return res.status(200).send({
                status: 'success',
                article: articleRemove
            });
        });

    },

    /* ----------------------- Método para subir archivos ----------------------- */

    upload: (req, res) => {

        /* -------- Configurar el modulo connect multiparty router/article.js ------- */

        /* -------------------- Recoger el fichero de la petición ------------------- */

        var fileName = 'Imagen no guardada';

        if (!req.files) {
            return res.status(404).send({
                status: 'error',
                message: fileName
            });
        }

        /* ------------- Conseguir el nombre y la extensión del archivo ------------- */

        var file_path = req.files.file0.path;

        var file_split = file_path.split('\\');

        /* ----------------- Para Linux o Mac en vez de '\\' es '/' ----------------- */

        var fileName = file_split[2];

        var extension_split = fileName.split('\.');

        var file_ext = extension_split[1];

        /* -- Comprobar la extensión, solo imagenes, si es valida borrar el fichero - */

        if (file_ext != 'png' && file_ext != 'jpg' && file_ext != 'gif' && file_ext != 'jpeg') {

            fs.unlink(file_path, (err) => {
                return res.status(400).send({
                    status: 'error',
                    message: 'La extensión no es válida'
                });
            });

        } else {

            /* --- Buscar el artículo, asignarle el nombre de la imagen y actualizarlo -- */

            var articleId = req.params.id;

            Article.findOneAndUpdate({ _id: articleId }, { image: fileName }, { new: true }, (err, articleUpdate) => {

                if (err || !articleUpdate) {
                    return res.status(400).send({
                        status: 'error',
                        message: 'Error al guardar la imagen de artículo'
                    });
                }

                return res.status(200).send({
                    status: 'success',
                    article: articleUpdate
                });
            });

        }

    },

    /* -------------------------------------------------------------------------- */
    /*                 método para obtener una imagen del backend                 */
    /* -------------------------------------------------------------------------- */

    getImage: (req, res) => {

        var file = req.params.image;

        var path_file = './upload/articles/' + file;

        fs.exists(path_file, (exists) => {
            if (exists) {

                return res.sendFile(path.resolve(path_file));
            } else {

                return res.status(404).send({
                    status: 'error',
                    message: 'La imagen no existe'
                });
            }
        })
    },

    /* -------------------------------------------------------------------------- */
    /*                           Método para el buscador                          */
    /* -------------------------------------------------------------------------- */

    search: (req, res) => {

        /* ------------------------ Sacar el string a buscar ------------------------ */

        var seachString = req.params.search;

        /* -------------------------------- Buscamos -------------------------------- */

        Article.find({
            "$or": [{
                "title": {
                    "$regex": searchString,
                    "$options": "i"
                },
                "content": {
                    "$regex": searchString,
                    "$options": "i"
                },
            }]
        }).sort([
            ['date', 'descending']
        ]).exec((err, articles) => {
            if (err) {
                return res.status(500).send({
                    status: 'error',
                    message: 'Error en la petición'
                });
            }

            if (!articles) {
                return res.status(500).send({
                    status: 'error',
                    message: 'No hay artículos que coincidan con tu busqueda'
                });
            }

            return res.status(200).send({
                status: 'success',
                articles
            });
        })

    }
};

module.exports = controller;